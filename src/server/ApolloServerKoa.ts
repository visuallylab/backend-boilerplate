import * as path from 'path';
import * as Koa from 'koa';
import { Service, Inject, Container } from 'typedi';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-koa';

import {
  DEVELOPMENT,
  SKIP_AUTH,
  TEST,
  test,
  apollo,
  DEBUG,
} from '@/environment';
import JwtService from '@/services/JwtService';
import { ILogger } from '@/services/logger/Logger';
import rootLogger from '@/services/logger/rootLogger';
import { authChecker, createDummyMe } from '@/resolvers/authChecker';
import { Context } from '@/resolvers/typings';

import DataLoaderMiddleware from './middlewares/DataLoaderMiddleware';
import { GraphQLError } from 'graphql';

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
        container: Container, // register 3rd party IOC container
      });

      const apolloServer = new ApolloServer({
        schema,
        engine: !!apollo.engineApiKey && {
          apiKey: apollo.engineApiKey,
        },
        formatError: (error: GraphQLError) => {
          this.logger.error(error);
          return error;
        },
        formatResponse: DEBUG
          ? (response: any) => {
              this.logger.info('apollo response:', JSON.stringify(response));
              return response;
            }
          : undefined,
        context: async ({ ctx }: { ctx: Koa.Context }) => {
          if (SKIP_AUTH) {
            // always skip auth in stage & test
            const testUser = (TEST && test.user) || {};
            return { me: createDummyMe(testUser) };
          }
          if (ctx.request.headers.authorization) {
            try {
              const token = ctx.request.headers.authorization.replace(
                'Bearer ',
                '',
              );
              const me = await this.jwt.verify<Context['me']>(token);
              return { me };
            } catch (err) {
              this.logger.error(`Authorization token error! ${err}`);
            }
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
