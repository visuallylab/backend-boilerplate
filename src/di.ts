import * as typeOrm from 'typeorm';
import { Container } from 'typedi';

// register "typeorm" IOC container
typeOrm.useContainer(Container);
