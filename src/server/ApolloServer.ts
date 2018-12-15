import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import { ApolloServer as ApolloServerKoa } from 'apollo-server-koa';
import { Service, Inject } from 'typedi';

import * as env from '@/environment';
import { Logger } from '@/service/logger/Logger';
import resolvers from '@/graphql/resolvers';
import typeDefs from '@/graphql/typeDefs';

// import { createHouseStateDataLoader } from './dataloader';

@Service()
export class ApolloServer {
  private logger: Logger;
  private server: Koa = new Koa();

  constructor(@Inject() logger: Logger) {
    this.logger = logger.create('apollo-sserver');
    this.server.on('error', (error: any) => {
      if (error.status && error.status >= 400 && error.status < 500) {
        return;
      }
    });
  }

  public async launch() {
    // Connect db
    // await db.connect(config.db);

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

    // Apollo Server
    const apolloServer = new ApolloServerKoa({
      typeDefs,
      resolvers,
      // context: async ({ ctx }: { ctx: Koa.Context }) => {
      //   const token = ctx.request.headers.authorization;
      //   try {
      //     const me = await jwt.verify(
      //       token.replace('Bearer ', ''),
      //       config.secret
      //     );
      //     return { me };
      //   } catch (e) {
      //     return {};
      //   }
      // },
    });

    apolloServer.applyMiddleware({ app: this.server });

    const port = parseInt(env.server.port, 10);
    this.server.listen(port, () => {
      // tslint:disable-next-line:no-console
      console.log(`🚀 Server ready at port ${port}`);
    });
  }
}
