/**
 * Type-graphql will integrate with dataloader at version@1.0.0.
 * Before that, we use a middleware to handle all relation dataloader.
 * @see https://github.com/19majkel94/type-graphql/issues/51#issuecomment-408556675
 */

import * as DataLoader from 'dataloader';
import { Connection } from 'typeorm';
import { Service } from 'typedi';
import { InjectConnection } from 'typeorm-typedi-extensions';
import { MiddlewareInterface, NextFn, ResolverData } from 'type-graphql';

import { Context } from '@/resolvers/types';
import { ILogger } from '@/service/logger/Logger';
import rootLogger from '@/service/logger/rootLogger';

@Service()
export default class DataLoaderMiddleware implements MiddlewareInterface<Context> {
  private logger: ILogger;

  @InjectConnection()
  private connection!: Connection;

  constructor(logger = rootLogger) {
    this.logger = logger.create('middleware/dataloader');
  }

  public async use({ context }: ResolverData<Context>, next: NextFn) {

    if (!context.dataLoader || !context.dataLoader.initialized) {
      context.dataLoader = {
        initialized: true,
        loaders: {},
      };

      const loaders = context.dataLoader.loaders;

      this.connection.entityMetadatas.forEach(entityMetadata => {
        const resolverName = entityMetadata.targetName;
        if (!resolverName) {
          return;
        }

        if (!loaders[resolverName]) {
          loaders[resolverName] = {};
        }

        entityMetadata.relations.forEach(relation => {
          const relationName = relation.propertyName;
          // define data loader for this method if it was not defined yet
          if (!loaders[resolverName][relationName]) {
            // create a new instance of dataloader for every relation
            loaders[resolverName][relationName] = new DataLoader(
              entities => {
                this.logger.debug(`load: ${resolverName}.${relationName}`);
                return this.connection.relationIdLoader
                  // dataloader should return all entity object with parent and children.
                  .loadManyToManyRelationIdsAndGroup(relation, entities)
                  .then(groups => groups.map(group => group.related));
              },
            );
          }
        });
      });
    }
    return next();
  }
}
