import { gql } from 'apollo-server-koa';

export const Item = gql`
  type Item {
    id: ID
    name: String!
    description: String!
    complete: Boolean!
    timestamp: String!
  }
`;
