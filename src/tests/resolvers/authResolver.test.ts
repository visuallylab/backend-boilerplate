import gql from 'graphql-tag';
import { Container } from 'typedi';
import { createTestClient } from 'apollo-server-testing';

import DB from '@/service/DB';
import ApolloServerKoa from '@/server/ApolloServerKoa';

import User from '@/entities/User';

import * as dbUtils from '../utils/db';

const testDB = Container.get<DB>(DB);
const apolloServerKoa = Container.get<ApolloServerKoa>(ApolloServerKoa);

const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(login: {
      email: $email,
      password: $password,
    }) {
      token
      user {
        displayName
        email
      }
    }
  }
`;

let client: any;
beforeAll(async () => {

  await testDB.connect();

  const gqlServer  = await apolloServerKoa.initializeServer();
  client = createTestClient(gqlServer as any);

  await dbUtils.createTestUsers([{
    displayName: 'test',
    email: 'dummy@dummy.com',
    password: '123321',
  }]);
});

describe('AuthResolver queries:', () => {

  test('login failed: throw Error "No this user!"', async () => {
    const res = await client.mutate({
      mutation: LOGIN,
      variables: {
        email: 'a@a.a',
        password: '123',
      },
    });

    expect(res.errors[0].message).toBe('No this user!');
  });

  test('login failed: throw Error "Password wrong!"', async () => {
    const res = await client.mutate({
      mutation: LOGIN,
      variables: {
        email: 'dummy@dummy.com',
        password: '123',
      },
    });

    expect(res.errors[0].message).toBe('Password is wrong!');
  });

  test('login success', async () => {
    const res = await client.mutate({
      mutation: LOGIN,
      variables: {
        email: 'dummy@dummy.com',
        password: '123321',
      },
    });
    expect(res.data.login.token).toMatch(/.*/); // string anything
    expect(res.data.login.user.displayName).toBe('test');
    expect(res.data.login.user.email).toBe('dummy@dummy.com');
  });
});

afterAll(async () => {
  await dbUtils.clear([User]);
});
