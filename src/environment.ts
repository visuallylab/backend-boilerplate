import { config } from 'dotenv';
import * as path from 'path';
import * as ip from 'ip';

// read .env file
config({ path: path.resolve(__dirname, '../.env') });

type Environment = 'development' | 'stage' | 'production';

const env = (key: string, defaultValue = '') =>
  process.env[key] || defaultValue;

// runtime environment mode
export const NODE_ENV = <Environment> env('NODE_ENV', 'development').toLowerCase();

if (!['development', 'stage', 'production', 'test'].includes(NODE_ENV)) {
  throw new Error(`invalid NODE_ENV: ${NODE_ENV}`);
}

export const PRODUCTION = NODE_ENV === 'production';
export const STAGE = NODE_ENV === 'stage';
export const DEVELOPMENT = NODE_ENV === 'development';

// metadata
export const PROJECT = 'backend-server';
export const VERSION = env('VERSION', 'No version info');
export const IP_ADDRESS = ip.address();

// config
export const server = {
  port: env('PORT', '8081'),
  jwtSecret: env('JWT_SECRET'),
};

export const slack = {
  token: env('SLACK_TOKEN'),
  channel: env('SLACK_CHANNEL'),
  rateLimiting: env('SLACK_RATE_LIMITING', '0'),
};

export const db = {
  host: env('DB_HOST'),
  port: env('DB_PORT'),
  username: env('DB_USERNAME'),
  password: env('DB_PASSWORD'),
  database: env('DB_DATABASE'),
};

export const aws = {
  accessKeyId: env('AWS_ACCESS_KEY_ID'),
  secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
  region: env('AWS_REGION'),
};
