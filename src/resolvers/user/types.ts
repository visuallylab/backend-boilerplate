import { InputType, Field, ID, Int } from 'type-graphql';

import User from '@/entities/User';

@InputType('UserWhereType')
class WhereType {
  @Field(() => ID, { nullable: true })
  public id: string;

  @Field({ nullable: true })
  public displayName: string;

  @Field({ nullable: true })
  public email: string;

  @Field({ nullable: true })
  public avatar: string;

  @Field(() => Int, { nullable: true })
  public itemCount: number;

  @Field({ nullable: true })
  public createdAt: Date;

  @Field({ nullable: true })
  public updatedAt: Date;
}

@InputType('UserOrderType')
class OrderType {

  @Field({ nullable: true })
  public id: 'ASC' | 'DESC';

  @Field({ nullable: true })
  public itemCount: 'ASC' | 'DESC';

  @Field({ nullable: true })
  public createdAt: 'ASC' | 'DESC';
}

@InputType('UserFindOptionsInput')
export class FindOptionsInput {
  @Field(() => WhereType, { nullable: true })
  public where?: {
    [key: string]: any,
  };

  @Field(() => OrderType, { nullable: true })
  public order?: {
    id: 'ASC' | 'DESC',
    itemCount: 'ASC' | 'DESC',
    createdAt: 'ASC' | 'DESC',
  };
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
