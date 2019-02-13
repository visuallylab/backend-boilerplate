import { Service } from 'typedi';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';

import { ILogger } from '@/service/logger/Logger';
import rootLogger from '@/service/logger/rootLogger';

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
    this.initializeServer();
  }

  public async initializeServer(): Promise<Koa> {
    if (!this.initialized) {
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

      this.initialized = true;

      this.logger.debug('🚀 Koa server initialized!');
    }

    return this.server;
  }
}
