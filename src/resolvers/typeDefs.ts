import { gql } from 'apollo-server-koa';

const typeDefs = gql`
  type Mutation {
    addItem(name: String!, description: String): Item
    updateItem(id: ID!, name: String, description: String, complete: Boolean): Item
    deleteItem(id: ID!): Item
  }
`;

export default [typeDefs];
