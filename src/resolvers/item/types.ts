import { InputType, Field } from 'type-graphql';

import Item from '@/entities/Item';

@InputType()
export class AddItemInput implements Partial<Item> {
  @Field()
  public name!: string;

  @Field({ defaultValue: '' })
  public description!: string;
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
