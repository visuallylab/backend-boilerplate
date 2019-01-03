import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Resolver, Query, Arg, Int } from 'type-graphql';

import Item from '@/entities/item';
// console.log(123);
// type ItemPayload = {
//   id: number;
// } & UpdatePayload;

// type UpdatePayload = {
//   name: string;
//   description: string;
//   complete: boolean;
// };

// const item = Container.get<Item>(Item);

@Resolver(Item)
export class ItemResolver {
  constructor(
    @InjectRepository(Item) private readonly itemsRepository: Repository<Item>,
  ) {}

  @Query(() => String)
  public hello() {
    return '1233';
  }

  @Query(() => Item,  { nullable: true })
  public item(
    @Arg('itemId', () => Int) itemId: number,
  ) {
    return this.itemsRepository.findOne({ id: itemId });
  }

  @Query(() => [Item])
  public items() {
    return this.itemsRepository.find();
  }

}

// export default {
//   Query: {
//     items: async () => getRepository(Items).find(),
//   },
//   Mutation: {
//     async addItem(_parent: any, { name, description = '' }: ItemPayload) {
//       const item = new Items();
//       item.name = name;
//       item.description = description;

//       await getRepository(Items).save(item);
//       return item;
//     },
//     async updateItem(_parent: any, { id, name, description, complete }: ItemPayload) {
//       const repository = getRepository(Items);
//       const match = await repository.findOne({ id });
//       if (!match) { return; }
//       if (name) { match.name = name; }
//       if (description) { match.description = description; }
//       if (complete) { match.complete = complete; }
//       await repository.save(match);
//       return match;
//     },
//     async deleteItem(_parent: any, { id }: { id: number }) {
//       const repository = getRepository(Items);
//       const item = await repository.findOne({ id });
//       if (!item) { return; }
//       await repository.remove(item);
//       return item;
//     },
//   },
// };
