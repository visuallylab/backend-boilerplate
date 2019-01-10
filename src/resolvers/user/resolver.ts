import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ForbiddenError } from 'apollo-server-koa';
import { Resolver, Query, Arg, Mutation, FieldResolver, Root, Ctx, Authorized } from 'type-graphql';

import User from '@/entities/User';
import Item from '@/entities/Item';

import { Context } from '../types';
import { CreateUserInput, UpdateUserInput } from './types';

@Resolver(User)
export class UserResolver {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Item) private readonly itemRepository: Repository<Item>,
  ) {}

  @Authorized()
  @Query(() => User, { nullable: true })
  public async user(@Arg('uuid') uuid: string) {
    return this.userRepository.findOne({ uuid });
  }

  @Authorized()
  @Query(() => [User])
  public async users() {
    return this.userRepository.find();
  }

  @Mutation(() => User)
  public async createUser(@Arg('user') userInput: CreateUserInput) {
    const user = this.userRepository.create({ ...userInput });
    await this.userRepository.save(user);
    return user;
  }

  @Authorized()
  @Mutation(() => User)
  public async updateUser(
    @Arg('uuid') uuid: string,
    @Arg('user') userInput: UpdateUserInput,
  ) {
    const { displayName, email } = userInput;
    const match = await this.userRepository.findOne({ uuid });
    if (!match) { return; }
    if (displayName) { match.displayName = displayName; }
    if (email) { match.email = email; }

    await this.userRepository.save(match);
    return match;
  }

  @Authorized()
  @Mutation(() => User)
  public async deleteUser(
    @Arg('uuid') uuid: string,
    @Ctx() ctx: Context,
  ) {
    const user = await this.userRepository.findOne({ uuid });
    if (!user) {
      throw new ForbiddenError('No this user!');
    }
    const items = await ctx.dataLoader.loaders.User.items.load(user);
    const copyUser = { ...user, items };

    await this.itemRepository.remove(items);
    await this.userRepository.remove(user);
    return copyUser;
  }

  @FieldResolver()
  protected async items(@Root() user: User, @Ctx() ctx: Context) {
    return ctx.dataLoader.loaders.User.items.load(user);
  }
}
