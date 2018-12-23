import 'reflect-metadata';
import { Container } from 'typedi';

import { ApolloServer } from './server/ApolloServer';
import rootLogger from './service/logger/rootLogger';

const apolloServer = Container.get<ApolloServer>(ApolloServer);

(async () => {

  await apolloServer.launch();

})().catch(error => {
  rootLogger.error(error);
  process.exit(1);
});
