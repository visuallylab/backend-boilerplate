import { InputType, Field, ObjectType } from 'type-graphql';
import User from '@/entities/User';

@InputType()
export class LoginInput {
  @Field()
  public email: string;

  @Field()
  public password: string;
}

@ObjectType()
export class LoginOutput {

  @Field()
  public token: string;

  @Field()
  public user: User;
}
