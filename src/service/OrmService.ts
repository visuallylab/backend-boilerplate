import * as path from 'path';
import { Service } from 'typedi';
import { createConnections } from 'typeorm';

import { ILogger } from '@/service/logger/Logger';
import rootLogger from '@/service/logger/rootLogger';
import { db } from '@/environment';

interface IOrmService {
  connect: () => Promise<void>;
}

@Service()
export class OrmService implements IOrmService {
  private logger: ILogger;

  constructor(logger = rootLogger) {
    this.logger = logger.create('service/orm');
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
            path.resolve(__dirname, './entities/*.ts'),
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
