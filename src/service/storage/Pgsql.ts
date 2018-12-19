import { Client } from 'pg';
import { Service } from 'typedi';

import { ILogger } from '@/service/logger/Logger';
import rootLogger from '@/service/logger/rootLogger';

interface IPgsql {
  connect: () => Promise<Client>;
  close: () => Promise<void>;
}

// TODO: let every connection has its owen client

@Service()
export class Pgsql implements IPgsql {
  private client: Client = new Client();
  private logger: ILogger;
  private isConnecting: boolean = false;

  constructor(logger = rootLogger) {
    this.logger = logger.create('service/pgsql');
  }

  public async connect() {
    if (this.isConnecting) {
      return this.client;
    }

    await this.client.connect();

    this.isConnecting = true;

    this.logger.info('client started');

    this.client.on('error', err => this.logger.error('client error', `${err}`));
    this.client.on('end', () => this.logger.info('client ended'));

    return this.client;
  }

  public async close() {
    if (this.isConnecting) {
      await this.client.end();

      this.isConnecting = false;
    }
  }
}
