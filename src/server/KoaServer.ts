import { Service } from 'typedi';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as helmet from 'koa-helmet';
import * as cors from '@koa/cors';

import { ILogger } from '@/services/logger/Logger';
import rootLogger from '@/services/logger/rootLogger';

import router from './router';

@Service()
export default class KoaServer {
  private initialized: boolean = false;
  private logger: ILogger;
  private server: Koa = new Koa();

  constructor(logger = rootLogger) {
    this.logger = logger.create('koa-server');
    this.server.on('error', (error: any) => {
      if (error.status && error.status >= 400 && error.status < 500) {
        return;
      }
    });
  }

  public async initializeServer(): Promise<Koa> {
    if (!this.initialized) {
      this.server.use(this.catchError);

      this.server.use(bodyParser());

      this.server.use(helmet()); // https://helmetjs.github.io/docs/

      this.server.use(cors({ credentials: true })); // with cookie

      this.server.use(router.routes()); // use routers
      this.server.use(router.allowedMethods());

      this.initialized = true;

      this.logger.debug('🚀 Koa initialized!');
    }

    return this.server;
  }

  public async catchError(ctx: Koa.ParameterizedContext, next: () => any) {
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
  }
}
