import { config } from 'dotenv';
import * as path from 'path';
import * as yargs from 'yargs';
import * as ip from 'ip';

const envConfigPath = (() => {
  switch (process.env.NODE_ENV) {
    case 'test': return  '../.env.test';
    case 'development':
    case 'production':
    default: return '../.env';
  }
})();

// read .env file
config({ path: path.resolve(__dirname, envConfigPath)});

type Environment = 'development' | 'stage' | 'production' | 'test';

const argv = yargs
  .option('--skip-auth', { boolean: true, default: false })
  .argv;

const env = (key: string, defaultValue = '') => process.env[key] || defaultValue;
const arg = (key: string, defaultValue?: any) => argv[key] || defaultValue;

// runtime environment mode
export const NODE_ENV = <Environment> env('NODE_ENV', 'development').toLowerCase();
export const PRODUCTION = NODE_ENV === 'production';
export const STAGE = NODE_ENV === 'stage';
export const DEVELOPMENT = NODE_ENV === 'development';
export const TEST = NODE_ENV === 'test';

if (!['development', 'stage', 'production', 'test'].includes(NODE_ENV)) {
  throw new Error(`invalid NODE_ENV: ${NODE_ENV}`);
}

// metadata
export const PROJECT = env('PROJECT', 'Awesome VisuallyLab!');
export const VERSION = env('VERSION', 'No version info');
export const IP_ADDRESS = ip.address();

// functionality
export const SKIP_AUTH = !!arg('--skip-auth', STAGE || TEST); // always skip auth in stage & TEST

// config
export const server = {
  port: env('PORT', '8081'),
  jwtSecretKey: env('JWT_SECRET_KEY'),
  jwtExpireIn: env('JWT_EXPIRE_IN'),
};

export const slack = {
  token: env('SLACK_TOKEN'),
  channel: env('SLACK_CHANNEL'),
  rateLimiting: env('SLACK_RATE_LIMITING', '0'),
};

export const db = {
  pgsql: {
    host: env('PGSQL_HOST'),
    port: env('PGSQL_PORT'),
    username: env('PGSQL_USERNAME'),
    password: env('PGSQL_PASSWORD'),
    database: env('PGSQL_DATABASE'),
  },
};

export const aws = {
  accessKeyId: env('AWS_ACCESS_KEY_ID'),
  secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
  region: env('AWS_REGION'),
};

// jest runtime global environment
export const test = {
  user: {},
};
