import { Pool, PoolClient } from 'pg';
import { Service } from 'typedi';

import { ILogger } from '@/service/logger/Logger';
import rootLogger from '@/service/logger/rootLogger';

interface IPgsql {
  connect: () => Promise<PoolClient | undefined>;
}

@Service()
export class Pgsql implements IPgsql {
  private pool: Pool = new Pool();
  private clients: PoolClient[] = [];
  private logger: ILogger;

  constructor(logger = rootLogger) {
    this.logger = logger.create('service/pgsql');
    this.pool.on('error', err => {
      this.logger.error('Unexpected error on idle client', `${err}`);
    });
  }

  public async connect() {
    let client;
    try {
      client = await this.pool.connect();
      this.clients.push(client);
    } catch (err) {
      this.logger.error('get connection error', err);
    }
    return client;
  }
}
