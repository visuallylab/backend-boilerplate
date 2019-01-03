import 'reflect-metadata';
import { Container } from 'typedi';

import { DB } from './service/DB';
import { ApolloServer } from './server/ApolloServer';
import rootLogger from './service/logger/rootLogger';

const apolloServer = Container.get<ApolloServer>(ApolloServer);
const db = Container.get<DB>(DB);

(async () => {
  await db.connect();
  await apolloServer.launch();
})().catch(error => {
  rootLogger.error(error);
  process.exit(1);
});
