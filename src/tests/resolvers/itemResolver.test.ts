import gql from 'graphql-tag';
import { Container } from 'typedi';
import { createTestClient } from 'apollo-server-testing';

import DB from '@/service/DB';
import ApolloServerKoa from '@/server/ApolloServerKoa';
import Item from '@/entities/Item';
import User from '@/entities/User';
import * as env from '@/environment';

import * as dbUtils from '../utils/db';

const testDB = Container.get<DB>(DB);
const apolloServerKoa = Container.get<ApolloServerKoa>(ApolloServerKoa);

// const LOGIN = gql`
//   mutation login($email: String!, $password: String!) {
//     login(login: {
//       email: $email,
//       password: $password,
//     }) {
//       token
//       user {
//         id
//       }
//     }
//   }
// `;

const GET_ITEM = gql`
  query item($itemId: Int!) {
    item(itemId: $itemId) {
      id
      complete
    }
  }
`;

const GET_ITEMS = gql`
  {
    items {
      id
      name
    }
  }
`;

const ADD_ITEM = gql`
  mutation addItem($name: String!, $description: String) {
    addItem (item: {
      name: $name,
      description: $description,
    }) {
      id
      name
      description
      user {
        displayName
      }
    }
  }
`;

const UPDATE_ITEM = gql`
  mutation updateItem($id: Float!, $complete: Boolean) {
    updateItem(id: $id, item: {
      complete: $complete,
    }) {
      id
      name
      description
      complete
      user {
        displayName
      }
    }
  }
`;

const DELETE_ITEM = gql`
  mutation deleteItem($id: Float!) {
    deleteItem(id: $id) {
      id
      name
      complete
      description
      user {
        displayName
      }
    }
  }
`;

let client: any;
beforeAll(async () => {

  await testDB.connect();

  const gqlServer  = await apolloServerKoa.initializeServer();
  client = createTestClient(gqlServer as any);

  const users = await dbUtils.createTestUsers([{
    displayName: 'test',
    email: 'dummy@dummy.com',
    password: '123321',
  }]);

  // insert test user
  env.test.user = { ...users[0] };
});

describe('UserResolver queries:', () => {

  test('get item null', async () => {
    const res = await client.query({
      query: GET_ITEM,
      variables: {
        itemId: 1,
      },
    });
    expect(res.data.item).toBeNull();
  });

  test('get items empty: []', async () => {
    const res = await client.query({ query: GET_ITEMS });
    expect(res.data).toEqual({ items: [] });
  });

  test('add Item: test-item-1', async () => {
    const res = await client.mutate({
      mutation: ADD_ITEM,
      variables: {
        name: 'test-item-1',
        description: 'yoyoy',
      },
    });

    expect(res.data).toEqual({
      addItem: {
        id: '1',
        name: 'test-item-1',
        description: 'yoyoy',
        user: {
          displayName: 'test',
        },
      },
    });

  });

  test('update item: test-item-1', async () => {
    const res = await client.mutate({
      mutation: UPDATE_ITEM,
      variables: {
        id: 1,
        complete: true,
      },
    });

    expect(res.data).toEqual({
      updateItem: {
        id: '1',
        name: 'test-item-1',
        complete: true,
        description: 'yoyoy',
        user: {
          displayName: 'test',
        },
      },
    });

  });

  test('get item test-item-1', async () => {
    const res = await client.query({
      query: GET_ITEM,
      variables: {
        itemId: 1,
      },
    });
    expect(res.data).toEqual({
      item: {
        id: '1',
        complete: true,
      },
    });
  });

  test('get items [test-item-1]', async () => {
    const res = await client.query({ query: GET_ITEMS });
    expect(res.data).toEqual({ items: [{
      id: '1',
      name: 'test-item-1',
    }] });
  });

  test('delete item [test-item-1]', async () => {
    const res = await client.mutate({
      mutation: DELETE_ITEM,
      variables: {
        id: 1,
      },
    });

    expect(res.data).toEqual({
      deleteItem: {
        id: '1',
        name: 'test-item-1',
        complete: true,
        description: 'yoyoy',
        user: {
          displayName: 'test',
        },
      },
    });
  });

  test('After delete: get item null', async () => {
    const res = await client.query({
      query: GET_ITEM,
      variables: {
        itemId: 1,
      },
    });
    expect(res.data.item).toBeNull();
  });

  test('After delete: get items empty: []', async () => {
    const res = await client.query({ query: GET_ITEMS });
    expect(res.data).toEqual({ items: [] });
  });

});

afterAll(async () => {
  await dbUtils.clear([Item, User]);
});
