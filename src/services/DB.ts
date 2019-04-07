import * as path from 'path';
import { Service } from 'typedi';
import { createConnections } from 'typeorm';

import { ILogger } from '@/services/logger/Logger';
import rootLogger from '@/services/logger/rootLogger';
import { db, TEST, DEBUG } from '@/environment';

interface IDB {
  connect: () => Promise<void>;
}

@Service()
export default class DB implements IDB {
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
            path.resolve(__dirname, '../entities/*.ts'),
            path.resolve(__dirname, '../entities/*.js'),
          ],
          synchronize: true,
          logging: DEBUG ? ['error', 'query'] : ['error'],
          dropSchema: !!TEST, // only for test
        },
      ]);
      this.logger.info('🚀 DB orm is connected!');
    } catch (err) {
      this.logger.error(err);
    }
  }
}
