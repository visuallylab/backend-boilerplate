import { InputType, Field, Int, ArgsType } from 'type-graphql';

import User from '@/entities/User';

@InputType()
class UserOrderType {
  @Field({ nullable: true })
  public id: 'ASC' | 'DESC';

  @Field({ nullable: true })
  public itemCount: 'ASC' | 'DESC';

  @Field({ nullable: true })
  public createdAt: 'ASC' | 'DESC';
}

@ArgsType()
export class UserFilterArgs {
  @Field({ nullable: true })
  public displayName?: string;

  @Field({ nullable: true })
  public email?: string;

  @Field(() => Int, { nullable: true })
  public take?: number;

  @Field(() => UserOrderType, { nullable: true })
  public order?: UserOrderType;
}

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
