import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ForbiddenError } from 'apollo-server-koa';
import { Resolver, Query, Arg, Mutation, FieldResolver, Root, Ctx, Authorized } from 'type-graphql';

import User from '@/entities/User';
import Item from '@/entities/Item';

import { Context } from '../typings';
import { CreateUserInput, UpdateUserInput, FindOptionsInput } from './types';

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
  public async users(
    @Arg('findOptions', () => FindOptionsInput, { nullable: true }) findOptions: FindOptionsInput,
  ) {
    // FIXME: should no use seperator
    return this.userRepository.find({
      where: { ...findOptions.where },
      order: { ...findOptions.order },
    });
  }

  @Mutation(() => User)
  public async createUser(@Arg('user') userInput: CreateUserInput) {
    const saltedHash = await bcrypt.hash(userInput.password, 10); // salted password

    const saltedUser = {
      ...userInput,
      password: saltedHash,
    };

    const user = this.userRepository.create({ ...saltedUser });
    await this.userRepository.save(user);
    return user;
  }

  @Authorized()
  @Mutation(() => User)
  public async updateUser(
    @Arg('id') id: string,
    @Arg('user') userInput: UpdateUserInput,
  ) {
    const { displayName, email } = userInput;
    const match = await this.userRepository.findOne({ id });
    if (!match) { return; }
    if (displayName) { match.displayName = displayName; }
    if (email) { match.email = email; }

    await this.userRepository.save(match);
    return match;
  }

  @Authorized()
  @Mutation(() => User)
  public async deleteUser(
    @Arg('id') id: string,
    @Ctx() ctx: Context,
  ) {
    const user = await this.userRepository.findOne({ id });
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

  @FieldResolver()
  protected async itemCount(@Root() user: User, @Ctx() ctx: Context) {
    const items = await ctx.dataLoader.loaders.User.items.load(user);
    return items.length;
  }
}
