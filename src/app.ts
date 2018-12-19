import 'reflect-metadata';
import { Container } from 'typedi';

import { Pgsql } from './service/storage/Pgsql';
import { ApolloServer } from './server/ApolloServer';
import rootLogger from './service/logger/rootLogger';

const apolloServer = Container.get<ApolloServer>(ApolloServer);
const pgsql = Container.get<Pgsql>(Pgsql);

(async () => {

  await pgsql.connect();
  await apolloServer.launch();

})().catch(error => {
  rootLogger.error(error);
  process.exit(1);
});
