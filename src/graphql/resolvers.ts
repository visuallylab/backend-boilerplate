import itemsResolver from './items/resolvers';

export default {
  Query: {
    ...itemsResolver.Query,
    hello: () => '123',
  },
  Mutation: {
    ...itemsResolver.Mutation,
  },
};
