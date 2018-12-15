import 'reflect-metadata';
import { Container } from 'typedi';

import { Logger } from './service/logger/Logger';
import { ApolloServer } from './server/ApolloServer';

const apolloServerKoa = Container.get<ApolloServer>(ApolloServer);
const logger = Container.get<Logger>(Logger);

(async () => {

  apolloServerKoa.launch();

})().catch(error => {
  logger.error(error);
  process.exit(1);
});
