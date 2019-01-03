import { Service, Container } from 'typedi';
import { createConnections, useContainer } from 'typeorm';

import { ILogger } from '@/service/logger/Logger';
import rootLogger from '@/service/logger/rootLogger';
import { db } from '@/environment';

import Item from '@/entities/Item';

console.log('ormItem', Item);

interface IDB {
  connect: () => Promise<void>;
}

// register IOC container
useContainer(Container);

@Service()
export class DB implements IDB {
  private logger: ILogger;

  constructor(logger = rootLogger) {
    this.logger = logger.create('service/db');
  }

  public async connect() {
    try {
      await createConnections([
        {
          type: 'postgres',
          host: db.pgsql.host,
          port: parseInt(db.pgsql.port, 10),
          username: db.pgsql.username,
          password: db.pgsql.password,
          database: db.pgsql.database,
          entities: [
            Item,
          ],
          synchronize: true,
          logging: ['error'],
        },
      ]);
      this.logger.info('DB orm is connected!');
    } catch (err) {
      this.logger.error(err);
    }
  }
}
