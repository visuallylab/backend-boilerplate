import { Service } from 'typedi';
import { Pool, PoolClient } from 'pg';

import { ILogger } from '@/services/logger/Logger';
import rootLogger from '@/services/logger/rootLogger';
import * as env from '@/environments';

interface IPgsql {
  connect: () => Promise<PoolClient | undefined>;
}

const { username, host, database, password, port } = env.db.pgsql;

@Service()
export class Pgsql implements IPgsql {
  private pool: Pool = new Pool({
    user: username,
    host,
    database,
    password,
    port: parseInt(port, 10),
  });
  private clients: PoolClient[] = [];
  private logger: ILogger;

  constructor(logger = rootLogger) {
    this.logger = logger.create('service/pgsql');
    this.pool.on('error', (err) => {
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

  public async closeAllConnection() {
    await Promise.all(this.clients.map((client) => client.release()));
  }
}
