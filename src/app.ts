import 'reflect-metadata';

import './di';

import { Container } from 'typedi';

import * as env from '@/environment';

import DB from './service/DB';
import KoaServer from './server/KoaServer';
import ApolloServer from './server/ApolloServer';
import rootLogger from './service/logger/rootLogger';

const db = Container.get<DB>(DB);
const koaServer = Container.get<KoaServer>(KoaServer);
const apolloServer = Container.get<ApolloServer>(ApolloServer);

(async () => {

  await db.connect();

  const httpServer = await koaServer.initializeServer();
  const gqlServer = await apolloServer.initializeServer();

  gqlServer.applyMiddleware({ app: httpServer });

  const port = parseInt(env.server.port, 10);
  httpServer.listen(port, () => {
    rootLogger.info(`🚀 Server ready at port ${port}`);
  });

})().catch(error => {
  rootLogger.error(error);
  process.exit(1);
});
