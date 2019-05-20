const Koa = require('koa');
const bodyParser = require('koa-body');
const koaLogger = require('koa-logger');
const koaHelmet = require('koa-helmet');
const createError = require('http-errors');
const cors = require('@koa/cors');
const config = require('config');

module.exports = (router, logger = console) => {
  const app = new Koa();

  // x-response-time
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', ms);
  });

  app.use(cors());

  app.use(
    bodyParser({
      urlencoded: true,
    })
  );

  app.use(koaHelmet());

  if (config.get('env') !== 'production' && config.get('env') !== 'test')
    app.use(koaLogger());

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      // will only respond with JSON
      if (!err.expose) {
        ctx.status = 500;
        ctx.body = {
          errors: [{ code: 500, message: 'unexpected error' }],
        };

        ctx.app.emit('error', err, ctx);
      } else {
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = {
          errors: err.errors,
          detail: process.env === 'development' ? err : undefined,
        };

        ctx.app.emit('error', err, ctx);
      }
    }
  });

  app.use(async (ctx, next) => {
    if (
      ctx.request.method !== 'GET' &&
      !/application\/json/.test(ctx.headers['content-type'])
    ) {
      ctx.throw(
        createError(415, 'unsupported media type', {
          errors: [{ code: 415, message: 'unsupported media type' }],
        })
      );
    } else {
      await next();
    }
  });

  app.use(router.routes());

  app.use(async (ctx, next) => {
    ctx.throw(
      createError(404, 'not found', {
        errors: [{ code: 404, message: 'not found' }],
      })
    );

    await next();
  });

  app.on('error', err => {
    logger.error(err);
  });

  return app;
};
