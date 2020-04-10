import * as Router from 'koa-router';
import { VERSION } from '@/constants';

const router = new Router();

/**
 * GET /
 */
router.get('/', (ctx: Router.RouterContext) => (ctx.body = 'Hello!'));

/**
 * GET /healthy
 */
router.get(
  '/healthy',
  (ctx: Router.RouterContext) => (ctx.body = 'Visuallylab is awesome!'),
);

/**
 * GET /version
 */
router.get('/version', (ctx: Router.RouterContext) => (ctx.body = VERSION));

export default router;
