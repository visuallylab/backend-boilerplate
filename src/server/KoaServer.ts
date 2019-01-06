import * as Koa from 'koa';
import * as websockify from 'koa-websocket';

export const koaServer = websockify(new Koa()); // websocket middleware

// koaServer.proxy = true;

export type KoaServer = websockify.App;

export default koaServer;
