import { Service } from 'typedi';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as Router from 'koa-router';

import { VERSION } from '@/environment';

import { ILogger } from '@/services/logger/Logger';
import rootLogger from '@/services/logger/rootLogger';

@Service()
export default class KoaServer {
  private initialized: boolean = false;
  private logger: ILogger;
  private server: Koa = new Koa();
  private router: Router = new Router();

  constructor(logger = rootLogger) {
    this.logger = logger.create('koa-server');
    this.server.on('error', (error: any) => {
      if (error.status && error.status >= 400 && error.status < 500) {
        return;
      }
    });
  }

  public initializeRouter() {
    /**
     * GET /healthy
     */
    this.router.get(
      '/healthy',
      (ctx: Router.RouterContext) => (ctx.body = 'Visuallylab is awesome!'),
    );

    /**
     * GET /version
     */
    this.router.get(
      '/version',
      (ctx: Router.RouterContext) => (ctx.body = VERSION),
    );
  }

  public async initializeServer(): Promise<Koa> {
    if (!this.initialized) {
      this.initializeRouter();

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

      this.server.use(this.router.routes()); // use routers
      this.server.use(this.router.allowedMethods());

      this.initialized = true;

      this.logger.debug('🚀 Koa initialized!');
    }

    return this.server;
  }
}
