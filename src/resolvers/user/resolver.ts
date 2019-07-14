import * as bcrypt from 'bcrypt';
import { Service } from 'typedi';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ForbiddenError } from 'apollo-server-koa';
import {
  Resolver,
  Query,
  Arg,
  Args,
  Mutation,
  FieldResolver,
  Root,
  Ctx,
  Authorized,
  ID,
} from 'type-graphql';

import User from '@/entities/User';
import Item from '@/entities/Item';

import { Context } from '../typings';
import { CreateUserInput, UpdateUserInput, UserFilterArgs } from './types';

@Service()
@Resolver(User)
export class UserResolver {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Item) private readonly itemRepository: Repository<Item>,
  ) {}

  @Authorized()
  @Query(() => User, { nullable: true })
  public async user(@Arg('id') id: string) {
    return this.userRepository.findOne({ id });
  }

  @Authorized()
  @Query(() => [User])
  public async users(@Args() filter: UserFilterArgs) {
    const query = filter ? buildQuery(filter) : {};
    return this.userRepository.find(query);
  }

  @Mutation(() => User)
  public async createUser(@Arg('user') userInput: CreateUserInput) {
    const saltedHash = await bcrypt.hash(userInput.password, 10); // salted password

    const created = await this.userRepository.save(
      this.userRepository.create({
        ...userInput,
        password: saltedHash,
      }),
    );
    return created;
  }

  @Authorized()
  @Mutation(() => User)
  public async updateUser(
    @Arg('id') id: string,
    @Arg('user') userInput: UpdateUserInput,
  ) {
    const { displayName, email } = userInput;
    const match = await this.userRepository.findOne({ id });
    if (!match) {
      return;
    }
    if (displayName) {
      match.displayName = displayName;
    }
    if (email) {
      match.email = email;
    }

    return this.userRepository.save(match);
  }

  @Authorized()
  @Mutation(() => ID)
  public async deleteUser(@Arg('id') id: string, @Ctx() ctx: Context) {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new ForbiddenError('No this user!');
    }

    // also delete the items of user
    const items = await ctx.dataLoader.loaders.User.items.load(user);

    await this.itemRepository.remove(items);
    await this.userRepository.remove(user);

    return id;
  }

  @FieldResolver()
  protected async items(@Root() user: User, @Ctx() ctx: Context) {
    return ctx.dataLoader.loaders.User.items.load(user);
  }

  @FieldResolver()
  protected async itemCount(@Root() user: User, @Ctx() ctx: Context) {
    return (await ctx.dataLoader.loaders.User.items.load(user)).length;
  }
}

function buildQuery(filter: UserFilterArgs) {
  const query: FindManyOptions<User> = {};
  query.where = {};
  if (filter) {
    if (filter.displayName) {
      query.where.displayName = Like(`%${filter.displayName}%`);
    }
    if (filter.email) {
      query.where.email = Like(`%${filter.email}%`);
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
