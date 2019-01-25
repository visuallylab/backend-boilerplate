import * as path from 'path';
import * as Koa from 'koa';
import { Service, Inject } from 'typedi';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-koa';

import { DEVELOPMENT, SKIP_AUTH } from '@/environment';
import JwtService from '@/service/JwtService';
import { ILogger } from '@/service/logger/Logger';
import rootLogger from '@/service/logger/rootLogger';
import { authChecker, createDummyMe } from '@/resolvers/authChecker';
import { Context } from '@/resolvers/typings';

import DataLoaderMiddleware from './middlewares/DataLoaderMiddleware';

@Service()
export default class ApolloServerKoa {
  private initialized: boolean = false;
  private logger: ILogger;
  private server: ApolloServer;

  @Inject()
  private jwt: JwtService;

  constructor(logger = rootLogger) {
    this.logger = logger.create('apollo-server');
    this.initializeServer();
  }

  public async initializeServer(): Promise<ApolloServer> {
    if (!this.initialized) {
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

      const apolloServer = new ApolloServer({
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

      this.server = apolloServer;
      this.initialized = true;

      this.logger.debug('🚀 Apollo server initialized!');
    }

    return this.server;
  }
}
