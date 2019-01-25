import { Container } from 'typedi';
import * as typeGraphql from 'type-graphql';
import * as typeOrm from 'typeorm';

// register "type-graphql" IOC container
typeGraphql.useContainer(Container);

// register "typeorm" IOC container
typeOrm.useContainer(Container);
