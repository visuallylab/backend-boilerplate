import { InputType, Field } from 'type-graphql';

import User from '@/entities/User';

@InputType()
export class CreateUserInput implements Partial<User> {

  @Field()
  public displayName: string;

  @Field()
  public email: string;

  @Field()
  public password: string;
}

@InputType()
export class UpdateUserInput implements Partial<User> {
  @Field({ nullable: true })
  public displayName?: string;

  @Field({ nullable: true })
  public email?: string;
}
