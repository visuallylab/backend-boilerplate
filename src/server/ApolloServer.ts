import { Service, Inject } from 'typedi';
import * as bodyParser from 'koa-bodyparser';
import { ApolloServer as ApolloServerKoa } from 'apollo-server-koa';

import * as env from '@/environment';
import { ILogger } from '@/service/logger/Logger';
import rootLogger from '@/service/logger/rootLogger';
import resolvers from '@/graphql/resolvers';
import typeDefs from '@/graphql/typeDefs';

import { koaServer, KoaServer } from './KoaServer';
// import { createHouseStateDataLoader } from './dataloader';
// import { Pgsql } from '../service/storage/Pgsql';

@Service()
export class ApolloServer {
  private logger: ILogger;
  private server: KoaServer = koaServer;

  constructor(logger = rootLogger) {
    this.logger = logger.create('apollo-server');
    this.server.on('error', (error: any) => {
      if (error.status && error.status >= 400 && error.status < 500) {
        return;
      }
    });
  }

  public async launch() {
    // TODO: Connect db

    this.server.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        this.logger.error(err);
        const errorCode =
          err.isBoom && err.data && err.data.code
            ? err.data.code
            : 'INTERNAL_ERROR';
        const statusCode =
          err.isBoom && err.output && err.output.statusCode
            ? err.output.statusCode
            : err.status || 500;

        ctx.status = statusCode;
        ctx.body = { code: errorCode, message: err.message };
      }
    });

    this.server.use(bodyParser());

    const apolloServer = new ApolloServerKoa({
      typeDefs,
      resolvers,
    });

    apolloServer.applyMiddleware({ app: this.server });

    const port = parseInt(env.server.port, 10);
    this.server.listen(port, () => {
      this.logger.info(`🚀 Server ready at port ${port}`);
    });
  }
}
