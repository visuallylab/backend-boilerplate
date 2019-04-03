import { InputType, Field, Int, ArgsType } from 'type-graphql';

import Item from '@/entities/Item';

@InputType()
class ItemOrderType {
  @Field({ nullable: true })
  public id: 'ASC' | 'DESC';

  @Field({ nullable: true })
  public createdAt: 'ASC' | 'DESC';
}

@ArgsType()
export class ItemFilterArgs {
  @Field({ nullable: true })
  public name?: string;

  @Field({ nullable: true })
  public description?: string;

  @Field(() => Boolean, { nullable: true })
  public complete?: boolean;

  @Field(() => Int, { nullable: true })
  public take?: number;

  @Field(() => ItemOrderType, { nullable: true })
  public order?: ItemOrderType;
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
