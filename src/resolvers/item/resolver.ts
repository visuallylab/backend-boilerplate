import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Resolver, Query, Arg, Int, Mutation } from 'type-graphql';

import Item from '@/entities/Item';

import { AddItemInput, UpdateItemInput } from './types';

@Resolver(Item)
export class ItemResolver {
  constructor(
    @InjectRepository(Item) private readonly itemsRepository: Repository<Item>,
  ) {}

  @Query(() => String)
  public hello() {
    return '1233';
  }

  @Query(() => Item, { nullable: true })
  public async item(@Arg('itemId', () => Int) itemId: number) {
    return this.itemsRepository.findOne({ id: itemId });
  }

  @Query(() => [Item])
  public async items() {
    return this.itemsRepository.find();
  }

  @Mutation(() => Item)
  public async addItem(@Arg('item') itemInput: AddItemInput) {
    const item = this.itemsRepository.create({ ...itemInput });
    await this.itemsRepository.save(item);
    return item;
  }

  @Mutation(() => Item)
  public async updateItem(
    @Arg('id') id: number,
    @Arg('item') itemInput: UpdateItemInput,
  ) {
    const { name, description, complete } = itemInput;
    const match = await this.itemsRepository.findOne({ id });
    if (!match) { return; }
    if (name) { match.name = name; }
    if (description) { match.description = description; }
    if (complete) { match.complete = complete; }

    await this.itemsRepository.save(match);
    return match;
  }

  @Mutation(() => String)
  public async deleteItem(
    @Arg('id') id: number,
  ) {
    const item = await this.itemsRepository.findOne({ id });
    if (!item) { return 'No this item!'; }

    await this.itemsRepository.remove(item);
    return `Delete item id: ${id}`;
  }
}
