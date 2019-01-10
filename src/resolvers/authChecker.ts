/**
 * use type-graphql decorator to implement auth
 * @see https://19majkel94.github.io/type-graphql/docs/authorization.html
 */

/**
 * TODO:
 * 1. Checking if user login
 * 2. Checking the Role and permission
 * @see https://github.com/Canner/graphql-rbac
 */

import { AuthChecker } from 'type-graphql';

import { Context, Role } from '@/resolvers/types';

export const authChecker: AuthChecker<Context> = ({ context: { me } }, roles) => {
  if (roles.length === 0) {
    // grant @Authorized() jwt verified
    return !!me;
  }

  // define more roles access here

  if (!me) {
    return false;
  }

  if (me.roles.some(role => roles.includes(role))) {
    return true;
  }

  return false;
};

export const createDummyMe = (option?: { [key: string]: any }): Context['me'] => ({
  uuid: '19514b75-1f74-4eb9-990b-e974126f3207',
  displayName: 'dummy',
  email: 'dummy@email.com',
  roles: [Role.Admin],
  ...option,
});
