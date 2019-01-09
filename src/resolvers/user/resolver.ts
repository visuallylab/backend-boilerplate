import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Resolver, Query, Arg, Mutation, FieldResolver, Root, Ctx } from 'type-graphql';

import User from '@/entities/User';

import { Context } from '../types';
import { AddUserInput, UpdateUserInput } from './types';

@Resolver(User)
export class UserResolver {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Query(() => User, { nullable: true })
  public async user(@Arg('uuid') uuid: string) {
    return this.userRepository.findOne({ uuid });
  }

  @Query(() => [User])
  public async users() {
    return this.userRepository.find();
  }

  @Mutation(() => User)
  public async addUser(@Arg('user') userInput: AddUserInput) {
    const user = this.userRepository.create({ ...userInput });
    await this.userRepository.save(user);
    return user;
  }

  @Mutation(() => User)
  public async updateUser(
    @Arg('uuid') uuid: string,
    @Arg('user') userInput: UpdateUserInput,
  ) {
    const { name, email } = userInput;
    const match = await this.userRepository.findOne({ uuid });
    if (!match) { return; }
    if (name) { match.name = name; }
    if (email) { match.email = email; }

    await this.userRepository.save(match);
    return match;
  }

  @Mutation(() => String)
  public async deleteUser(
    @Arg('uuid') uuid: string,
  ) {
    const user = await this.userRepository.findOne({ uuid });
    if (!user) { return 'No this item!'; }

    await this.userRepository.remove(user);
    return `Delete item id: ${uuid}`;
  }

  @FieldResolver()
  protected async items(@Root() user: User, @Ctx() ctx: Context) {
    return ctx.dataLoader.loaders.User.items.load(user);
  }
}
