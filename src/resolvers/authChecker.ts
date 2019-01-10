import { AuthChecker } from 'type-graphql';

import { Context } from '@/resolvers/types';

export const authChecker: AuthChecker<Context> = ({ context: { me } }, roles) => {
  if (roles.length === 0) {
    // if `@Authorized()`, check only is jwt verified
    return !!me;
  }
  // define more roles access here

  if (!me) {
    return false;
  }

  // TODO: more roles table
  if (me.roles.some(role => roles.includes(role))) {
    return true;
  }

  return false;
};
