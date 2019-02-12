const Router = require('koa-router');
const handler = require('./handler');

const router = new Router();

router.get('/healthcheck', ctx => {
  ctx.status = 200;
  ctx.response.body = {
    tick: Date.now(),
  };
});

module.exports = router;