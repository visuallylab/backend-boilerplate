import 'reflect-metadata';

import './di';

import { Container } from 'typedi';

import * as env from '@/environment';

import DB from './services/DB';
import KoaServer from './server/KoaServer';
import ApolloServerKoa from './server/ApolloServerKoa';
import rootLogger from './services/logger/rootLogger';

const db = Container.get<DB>(DB);
const koaServer = Container.get<KoaServer>(KoaServer);
const apolloServerKoa = Container.get<ApolloServerKoa>(ApolloServerKoa);

(async () => {
  await db.connect();

  const httpServer = await koaServer.initializeServer();
  {
    // gqlServer is an no-need resource, it can be released.
    try {
      const gqlServer = await apolloServerKoa.initializeServer();
      gqlServer.applyMiddleware({ app: httpServer });
    } catch (error) {
      // tslint:disable
      console.error(error);
    }
  }

  const port = parseInt(env.server.port, 10);
  httpServer.listen(port, () => {
    rootLogger.info(`🚀 HTTP Server ready at port ${port}`);
  });
})().catch(error => {
  rootLogger.error(error);
  process.exit(1);
});
