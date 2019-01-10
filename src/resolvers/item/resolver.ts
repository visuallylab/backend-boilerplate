import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Resolver, Query, Arg, Int, Mutation, Ctx, FieldResolver, Root, Authorized } from 'type-graphql';
import { ForbiddenError } from 'apollo-server-koa';

import Item from '@/entities/Item';
import User from '@/entities/User';

import { Context } from '../types';
import { AddItemInput, UpdateItemInput } from './types';

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
  public async items() {
    return this.itemsRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  @Authorized()
  @Mutation(() => Item)
  public async addItem(@Arg('item') itemInput: AddItemInput, @Ctx() ctx: Context) {
    const user = await this.userRepository.findOne({ id: ctx.me.id });
    const item = this.itemsRepository.create({
      ...itemInput,
      user,
    });
    await this.itemsRepository.save(item);
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
    if (!match) { return; }
    if (name) { match.name = name; }
    if (description) { match.description = description; }
    if (complete) { match.complete = complete; }

    await this.itemsRepository.save(match);
    return match;
  }

  @Authorized()
  @Mutation(() => Item)
  public async deleteItem(@Arg('id') id: number) {
    const item = await this.itemsRepository.findOne({ id });
    if (!item) {
      throw new ForbiddenError('No this item!');
    }
    const copyItem = { ...item };

    await this.itemsRepository.remove(item);

    return copyItem;
  }

  @FieldResolver()
  protected async user(@Root() item: Item, @Ctx() ctx: Context) {
    return ctx.dataLoader.loaders.Item.user.load(item);
  }
}
