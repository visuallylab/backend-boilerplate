import * as Koa from 'koa';
import * as websockify from 'koa-websocket';

export const koaServer = websockify(new Koa()); // websocket middleware

import Item from '@/entities/Item';

// koaServer.proxy = true;

export type KoaServer = websockify.App;
