import * as path from 'path';
import * as Koa from 'koa';
import { Service, Container, Inject } from 'typedi';
import * as bodyParser from 'koa-bodyparser';
import { buildSchema, useContainer } from 'type-graphql';
import { ApolloServer as ApolloServerKoa } from 'apollo-server-koa';

import { DEVELOPMENT, SKIP_AUTH, server } from '@/environment';
import JwtService from '@/service/JwtService';
import { ILogger } from '@/service/logger/Logger';
import rootLogger from '@/service/logger/rootLogger';
import { authChecker, createDummyMe } from '@/resolvers/authChecker';
import { Context } from '@/resolvers/typings';

import koaServer, { KoaServer } from './KoaServer';
import DataLoaderMiddleware from './middlewares/DataLoaderMiddleware';

// register type-graphql IOC container
useContainer(Container);

@Service()
export default class ApolloServer {
  private logger: ILogger;
  private server: KoaServer = koaServer;

  @Inject()
  private jwt: JwtService;

  constructor(logger = rootLogger) {
    this.logger = logger.create('apollo-server');
    this.server.on('error', (error: any) => {
      if (error.status && error.status >= 400 && error.status < 500) {
        return;
      }
    });
  }

  public async launch() {
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

    const schema = await buildSchema({
      globalMiddlewares: [DataLoaderMiddleware],
      resolvers: [
        path.resolve(__dirname, '../resolvers/**/resolver.ts'),
        path.resolve(__dirname, '../resolvers/**/resolver.js'), // production will bundle .js
      ],
      authChecker,
      dateScalarMode: 'timestamp',
      emitSchemaFile: !!DEVELOPMENT, // only for development
    });

    const apolloServer = new ApolloServerKoa({
      schema,
      context: async ({ ctx }: { ctx: Koa.Context }) => {
        const token = ctx.request.headers.authorization;

        if (SKIP_AUTH) {
          return { me: createDummyMe() };
        }

        try {
          const me = await this.jwt.verify<Context['me']>(token);
          return { me };
        } catch (e) {
          return;
        }
      },
      tracing: !!DEVELOPMENT, // only for development
    });

    apolloServer.applyMiddleware({ app: this.server });

    const port = parseInt(server.port, 10);
    this.server.listen(port, () => {
      this.logger.info(`🚀 Apollo server ready at port ${port}`);
    });
  }
}
