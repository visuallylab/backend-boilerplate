import { Repository } from 'typeorm';
import { Inject } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Resolver, Arg, Mutation } from 'type-graphql';
import { ForbiddenError } from 'apollo-server-koa';

import JwtService from '@/service/JwtService';
import User from '@/entities/User';

import { LoginInput, LoginOutput } from './types';

@Resolver()
export class AuthResolver {
  @Inject()
  private jwt!: JwtService;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Mutation(() => LoginOutput)
  public async login(@Arg('login') login: LoginInput) {
    const user = await this.userRepository.findOne({ email: login.email });
    if (!user) {
      throw new ForbiddenError('No this user!');
    }

    if (user.password === login.password) {
      const { uuid, displayName, email } = user;
      return {
        token: this.jwt.sign({ uuid, displayName, email }),
        user,
      };
    } else {
      throw new ForbiddenError('Password is wrong!');
    }
  }
}