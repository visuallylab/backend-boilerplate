import 'reflect-metadata';
import { Container } from 'typedi';

import { OrmService } from './service/OrmService';
import { ApolloServer } from './server/ApolloServer';
import rootLogger from './service/logger/rootLogger';

const apolloServer = Container.get<ApolloServer>(ApolloServer);
const ormService = Container.get<OrmService>(OrmService);

(async () => {

  await ormService.connect();
  await apolloServer.launch();

})().catch(error => {
  rootLogger.error(error);
  process.exit(1);
});
