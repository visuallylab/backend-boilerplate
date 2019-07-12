import gql from 'graphql-tag';
import { Container } from 'typedi';
import { createTestClient } from 'apollo-server-testing';

import DB from '@/services/DB';
import ApolloServerKoa from '@/server/ApolloServerKoa';
import User from '@/entities/User';
import * as env from '@/environment';

import * as dbUtils from '../utils/db';

const testDB = Container.get<DB>(DB);
const apolloServerKoa = Container.get<ApolloServerKoa>(ApolloServerKoa);

const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(login: { email: $email, password: $password }) {
      token
      user {
        id
      }
    }
  }
`;

const GET_USER = gql`
  query user($id: String!) {
    user(id: $id) {
      id
      displayName
      items {
        id
        name
        description
      }
    }
  }
`;

const GET_USERS = gql`
  {
    users {
      displayName
    }
  }
`;

const CREATE_USER = gql`
  mutation createUser(
    $displayName: String!
    $email: String!
    $password: String!
  ) {
    createUser(
      user: { displayName: $displayName, email: $email, password: $password }
    ) {
      displayName
      email
      items {
        id
      }
    }
  }
`;

const UPDATE_USER = gql`
  mutation updateUser($id: String!, $displayName: String) {
    updateUser(id: $id, user: { displayName: $displayName }) {
      id
      displayName
      email
      items {
        name
        description
      }
    }
  }
`;

const DELETE_USER = gql`
  mutation deleteUser($id: String!) {
    deleteUser(id: $id)
  }
`;

const ADD_ITEM = gql`
  mutation addItem($name: String!, $description: String) {
    addItem(item: { name: $name, description: $description }) {
      name
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

  const gqlServer = await apolloServerKoa.initializeServer();
  client = createTestClient(gqlServer as any);
});

describe('UserResolver queries:', () => {
  test('get user null', async () => {
    const res = await client.query({
      query: GET_USER,
      variables: {
        id: '19514b75-1f74-4eb9-990b-e974126f3207',
      },
    });
    expect(res.data.user).toBeNull();
  });

  test('get users empty: []', async () => {
    const res = await client.query({ query: GET_USERS });
    expect(res.data).toEqual({ users: [] });
  });

  test('create user: dummy@dummy.com', async () => {
    const res = await client.mutate({
      mutation: CREATE_USER,
      variables: {
        displayName: 'testQAQ',
        email: 'dummy@dummy.com',
        password: '123',
      },
    });
    expect(res.data).toEqual({
      createUser: {
        displayName: 'testQAQ',
        email: 'dummy@dummy.com',
        items: [],
      },
    });
  });

  test('insert items to user: dummy@dummy.com', async () => {
    const loginRes = await client.mutate({
      mutation: LOGIN,
      variables: {
        email: 'dummy@dummy.com',
        password: '123',
      },
    });

    env.test.user = {
      id: loginRes.data.login.user.id,
    };

    await client.mutate({
      mutation: ADD_ITEM,
      variables: {
        name: 'test1',
        description: 'yoyo-man',
      },
    });

    const res = await client.query({
      query: GET_USER,
      variables: {
        id: loginRes.data.login.user.id,
      },
    });

    expect(res.data).toEqual({
      user: {
        id: loginRes.data.login.user.id,
        displayName: 'testQAQ',
        items: [
          {
            id: '1',
            name: 'test1',
            description: 'yoyo-man',
          },
        ],
      },
    });
  });

  test('get users [{ ... }]', async () => {
    const res = await client.query({
      query: GET_USERS,
    });

    expect(res.data).toEqual({
      users: [
        {
          displayName: 'testQAQ',
        },
      ],
    });
  });

  test('update user', async () => {
    const loginRes = await client.mutate({
      mutation: LOGIN,
      variables: {
        email: 'dummy@dummy.com',
        password: '123',
      },
    });

    const updateRes = await client.mutate({
      mutation: UPDATE_USER,
      variables: {
        id: loginRes.data.login.user.id,
        displayName: 'testFuck !!',
      },
    });

    expect(updateRes.data).toEqual({
      updateUser: {
        id: loginRes.data.login.user.id,
        displayName: 'testFuck !!',
        email: 'dummy@dummy.com',
        items: [
          {
            name: 'test1',
            description: 'yoyo-man',
          },
        ],
      },
    });
  });

  test('delete user', async () => {
    const loginRes = await client.mutate({
      mutation: LOGIN,
      variables: {
        email: 'dummy@dummy.com',
        password: '123',
      },
    });

    const deleteRes = await client.mutate({
      mutation: DELETE_USER,
      variables: {
        id: loginRes.data.login.user.id,
      },
    });

    expect(deleteRes.data).toEqual({
      deleteUser: loginRes.data.login.user.id,
    });
  });

  test('After delete: users should be []', async () => {
    const usersRes = await client.query({ query: GET_USERS });
    expect(usersRes.data).toEqual({ users: [] });
  });
});

afterAll(async () => {
  await dbUtils.clear([User]);
});
