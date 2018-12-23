import { gql } from 'apollo-server-koa';
import { Item } from './items/typeDefs';

const typeDefs = gql`
  type Query {
    hello: String
    items: [Item]
  }

  type Mutation {
    addItem(name: String!, description: String): Item
    updateItem(id: ID!, name: String, description: String, complete: Boolean): Item
    deleteItem(id: ID!): Item
  }
`;

export default [typeDefs, Item];
