import { Service } from 'typedi';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import {
  Resolver,
  Query,
  Arg,
  Args,
  Int,
  Mutation,
  Ctx,
  FieldResolver,
  Root,
  Authorized,
  ID,
} from 'type-graphql';
import { ForbiddenError } from 'apollo-server-koa';

import Item from '@/entities/Item';
import User from '@/entities/User';

import { Context } from '../typings';
import { AddItemInput, UpdateItemInput, ItemFilterArgs } from './types';

@Service()
@Resolver(Item)
export class ItemResolver {
  constructor(
    @InjectRepository(Item) private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Query(() => Item, { nullable: true })
  public async item(@Arg('itemId', () => Int) itemId: number) {
    return this.itemsRepository.findOne({ id: itemId });
  }

  @Query(() => [Item])
  public async items(@Args() filter: ItemFilterArgs) {
    const query = filter ? buildQuery(filter) : {};
    return this.itemsRepository.find(query);
  }

  @Authorized()
  @Mutation(() => Item)
  public async addItem(
    @Arg('item') itemInput: AddItemInput,
    @Ctx() ctx: Context,
  ) {
    const user = await this.userRepository.findOne({ id: ctx.me.id });
    const item = await this.itemsRepository.save(
      this.itemsRepository.create({
        ...itemInput,
        user,
      }),
    );
    return item;
  }

  @Authorized()
  @Mutation(() => Item)
  public async updateItem(
    @Arg('id') id: number,
    @Arg('item') itemInput: UpdateItemInput,
  ) {
    const { name, description, complete } = itemInput;
    const match = await this.itemsRepository.findOne({ id });
    if (!match) {
      return;
    }
    if (name) {
      match.name = name;
    }
    if (description) {
      match.description = description;
    }
    if (complete) {
      match.complete = complete;
    }

    return this.itemsRepository.save(match);
  }

  @Authorized()
  @Mutation(() => ID)
  public async deleteItem(@Arg('id') id: number) {
    const item = await this.itemsRepository.findOne({ id });
    if (!item) {
      throw new ForbiddenError('No this item!');
    }
    await this.itemsRepository.remove(item);
    return id;
  }

  @FieldResolver()
  protected async user(@Root() item: Item, @Ctx() ctx: Context) {
    return ctx.dataLoader.loaders.Item.user.load(item);
  }
}

function buildQuery(filter: ItemFilterArgs) {
  const query: FindManyOptions<Item> = {};
  query.where = {};
  if (filter) {
    if (filter.name) {
      query.where.name = Like(`%${filter.name}%`);
    }
    if (filter.description) {
      query.where.description = Like(`%${filter.description}%`);
    }
    if (filter.complete) {
      query.where.complete = filter.complete;
    }
    if (filter.take) {
      query.take = filter.take;
    }
    if (filter.order) {
      query.order = filter.order;
    }
  }
  return query;
}
