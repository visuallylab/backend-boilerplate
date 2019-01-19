import { InputType, Field, ID } from 'type-graphql';

import Item from '@/entities/Item';

@InputType('ItemWhereType')
class WhereType {
  @Field(() => ID, { nullable: true })
  public id: number;

  @Field({ nullable: true })
  public name: string;

  @Field({ nullable: true })
  public description: string;

  @Field(() => Boolean, { nullable: true })
  public complete: boolean;

  @Field({ nullable: true })
  public createdAt: Date;
}

@InputType('ItemOrderType')
class OrderType {

  @Field({ nullable: true })
  public id: 'ASC' | 'DESC';

  @Field({ nullable: true })
  public createdAt: 'ASC' | 'DESC';
}

@InputType('ItemFindOptionsInput')
export class FindOptionsInput {
  @Field(() => WhereType, { nullable: true })
  public where?: {
    [key: string]: any,
  };

  @Field(() => OrderType, { nullable: true })
  public order?: {
    id: 'ASC' | 'DESC',
    createdAt: 'ASC' | 'DESC',
  };
}

@InputType()
export class AddItemInput implements Partial<Item> {
  @Field()
  public name: string;

  @Field({ defaultValue: '' })
  public description?: string;
}

@InputType()
export class UpdateItemInput implements Partial<Item> {
  @Field({ nullable: true })
  public name?: string;

  @Field({ nullable: true })
  public description?: string;

  @Field({ nullable: true })
  public complete?: boolean;
}
