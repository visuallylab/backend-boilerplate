import { InputType, Field } from 'type-graphql';

import User from '@/entities/User';

@InputType()
export class AddUserInput implements Partial<User> {
  @Field()
  public name!: string;

  @Field()
  public email!: string;
}

@InputType()
export class UpdateUserInput implements Partial<User> {
  @Field({ nullable: true })
  public name?: string;

  @Field({ nullable: true })
  public email?: string;
}
