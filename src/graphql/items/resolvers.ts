import { getRepository } from 'typeorm';

import Items from '@/entities/Items';

type ItemPayload = {
  id: number;
} & UpdatePayload;

type UpdatePayload = {
  name: string;
  description: string;
  complete: boolean;
};

export default {
  Query: {
    items: async () => getRepository(Items).find(),
  },
  Mutation: {
    async addItem(_parent: any, { name, description = '' }: ItemPayload) {
      const item = new Items();
      item.name = name;
      item.description = description;

      await getRepository(Items).save(item);
      return item;
    },
    async updateItem(_parent: any, { id, name, description, complete }: ItemPayload) {
      const repository = getRepository(Items);
      const match = await repository.findOne({ id });
      if (!match) { return; }
      if (name) { match.name = name; }
      if (description) { match.description = description; }
      if (complete) { match.complete = complete; }
      await repository.save(match);
      return match;
    },
    async deleteItem(_parent: any, { id }: { id: number }) {
      const repository = getRepository(Items);
      const item = await repository.findOne({ id });
      if (!item) { return; }
      await repository.remove(item);
      return item;
    },
  },
};
