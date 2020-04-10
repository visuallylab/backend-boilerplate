import { AuthChecker } from 'type-graphql';

import { Context } from '@/resolvers/typings';
import { AuthenticationError } from 'apollo-server-koa';
import { ErrorMessage } from '@/constants';

export const authChecker: AuthChecker<Context> = ({ context: { me } }) => {
  if (!me) {
    throw new AuthenticationError(ErrorMessage.System.PleaseLogin);
  }

  // if (me.roles.some(role => roles.includes(role))) {
  //   return true;
  // }

  return true;
};

export const createDummyMe = (option?: {
  [key: string]: any;
}): Context['me'] => ({
  id: '19514b75-1f74-4eb9-990b-e974126f3207',
  displayName: 'dummy',
  email: 'dummy@email.com',
  ...option,
});
