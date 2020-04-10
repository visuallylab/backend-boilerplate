import * as path from 'path';
import * as Koa from 'koa';
import { GraphQLError } from 'graphql';
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
} from '@/environments';
``;
import JwtService from '@/services/JwtService';
import { ILogger } from '@/services/logger/Logger';
import rootLogger from '@/services/logger/rootLogger';
import { authChecker, createDummyMe } from '@/resolvers/authChecker';
import { Context } from '@/resolvers/typings';

import DataloaderMiddleware from './middlewares/DataloaderMiddleware';
import { ErrorMessage } from '@/constants';

@Service()
export default class ApolloServerKoa {
  private initialized: boolean = false;
  private logger: ILogger;
  private server: ApolloServer;

  @Inject()
  private jwt: JwtService;

  constructor(logger = rootLogger) {
    this.logger = logger.create('apollo-server');
  }

  public async initializeServer(): Promise<ApolloServer> {
    if (!this.initialized) {
      const schema = await buildSchema({
        globalMiddlewares: [DataloaderMiddleware],
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
        plugins: [
          {
            requestDidStart() {
              return {
                didEncounterErrors({ response, errors }) {
                  if (
                    errors.find(
                      (err) =>
                        err.extensions &&
                        err.extensions.code === 'UNAUTHENTICATED',
                    ) &&
                    response &&
                    response.http
                  ) {
                    // error code: "UNAUTHENTICATED"
                    response.http.status = 401;
                  }
                },
              };
            },
          },
        ],
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
        context: (ctx) => this.parseContext(ctx),
        tracing: !!DEVELOPMENT, // only for development
      });

      this.server = apolloServer;
      this.initialized = true;

      this.logger.debug('🚀 Apollo initialized!');
    }

    return this.server;
  }

  async parseContext({ ctx: koaContext }: { ctx: Koa.Context }) {
    if (SKIP_AUTH) {
      // use fake user in test
      const testUser = (TEST && test.user) || {};
      const testKoaContext = koaContext || {
        cookies: {
          get: () => ({}),
          set: () => ({}),
        },
      };
      return { me: createDummyMe(testUser), koaContext: testKoaContext };
    }
    if (koaContext.request.headers.authorization) {
      try {
        const token = koaContext.request.headers.authorization.replace(
          'Bearer ',
          '',
        );
        const me = await this.jwt.verify<Context['me']>(token);
        return { me, koaContext };
      } catch (err) {
        this.logger.error(`${ErrorMessage.Auth.Token} ${err}`);
      }
    }

    return { me: null, koaContext };
  }
}
