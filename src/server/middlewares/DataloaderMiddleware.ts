/**
 * Type-graphql will integrate with dataloader at version@1.0.0.
 * Before that, we use a middleware to handle all relation dataloader.
 * @see https://github.com/19majkel94/type-graphql/issues/51#issuecomment-408556675
 */

import * as DataLoader from 'dataloader';
import { Connection, getConnection, EntityMetadata } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { Service } from 'typedi';
import { InjectConnection } from 'typeorm-typedi-extensions';
import { MiddlewareInterface, NextFn, ResolverData } from 'type-graphql';

import { Context } from '@/resolvers/typings';
import { ILogger } from '@/services/logger/Logger';
import rootLogger from '@/services/logger/rootLogger';

@Service()
export default class DataLoaderMiddleware
  implements MiddlewareInterface<Context> {
  private logger: ILogger;

  @InjectConnection()
  private connection: Connection;

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

      if (!this.connection) {
        // if connection is undefined
        this.connection = await getConnection();
      }

      this.connection.entityMetadatas.forEach(entityMetadata => {
        const resolverName = entityMetadata.targetName;
        if (!resolverName) {
          return;
        }

        if (!loaders.hasOwnProperty(resolverName)) {
          loaders[resolverName] = {};
        }

        entityMetadata.relations.forEach(relation => {
          const relationName = relation.propertyName;
          if (!loaders[resolverName].hasOwnProperty(relationName)) {
            // create an new instance of dataloader for every relation
            loaders[resolverName][relationName] = new DataLoader<
              EntityMetadata,
              any
            >(async entities => {
              this.logger.debug(`load: ${resolverName}.${relationName}`);
              if (relation.isManyToMany && relation.isManyToManyNotOwner) {
                return this.loadManyToManyNotOwner(relation, entities);
              }
              return (
                this.connection.relationIdLoader
                  // dataloader should return all entity object with parent and children.
                  .loadManyToManyRelationIdsAndGroup(relation, entities)
                  .then(groups => groups.map(group => group.related))
              );
            });
          }
        });
      });
    }
    return next();
  }

  private async loadManyToManyNotOwner(
    relation: RelationMetadata,
    entities: EntityMetadata[],
  ): Promise<EntityMetadata[][]> {
    /**
     * FIXME:
     * @see https://github.com/typeorm/typeorm/blob/master/src/query-builder/RelationIdLoader.ts
     * Because ManyToManyNotOwner relationId name is wrong, and will get nothing
     * We temporarily use this function to load
     */
    const relatedEntities = await this.connection.relationLoader.load(
      relation,
      entities,
    );

    if (!relatedEntities.length) {
      return entities.map(() => []);
    }

    const relationIds = await this.connection.relationIdLoader.load(
      relation,
      entities,
      relatedEntities,
    );
    const columns = relation.junctionEntityMetadata!.ownerColumns.map(
      column => column.referencedColumn!,
    );
    const inverseColumns = relation.junctionEntityMetadata!.inverseColumns.map(
      column => column.referencedColumn!,
    );

    return entities.map(entity => {
      const related: EntityMetadata[] = [];
      relationIds.forEach(relationId => {
        const entityMatched = inverseColumns.every(column => {
          return (
            column.getEntityValue(entity) ===
            relationId[
              // Name is different with typeorm.
              column.entityMetadata.name +
                '_' +
                relation.propertyPath.replace('.', '_') +
                '_' +
                column.propertyPath.replace('.', '_')
            ]
          );
        });
        if (entityMatched) {
          relatedEntities.forEach(relatedEntity => {
            const relatedEntityMatched = columns.every(column => {
              return (
                column.getEntityValue(relatedEntity) ===
                relationId[
                  // Name is different with typeorm.
                  column.entityMetadata.name +
                    '_' +
                    column.propertyPath.replace('.', '_')
                ]
              );
            });
            if (relatedEntityMatched) {
              related.push(relatedEntity);
            }
          });
        }
      });
      return related;
    });
  }
}
