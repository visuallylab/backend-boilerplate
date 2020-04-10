import { NODE_ENV } from './environments';

export const VERSION = `${NODE_ENV}-0.0.4`;

export const ErrorMessage = {
  Auth: {
    Token: 'Authorization token error.',
    Permission: 'Permission Denied!',
  },
  NotExist: {
    User: 'User does not exist.',
  },
  System: {
    PleaseLogin: 'Please Login!',
  },
};
