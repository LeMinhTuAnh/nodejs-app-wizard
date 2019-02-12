const http = require('http');
const config = require('config');
const router = require('./app/router');
const logger = require('./config/logger');
const app = require('./config/koa.config')(router, logger);
const mongoConf = require('./config/mongo.config');
const rabbitConf = require('./config/rabbit.config');
const messageBroker = require('./config/messageBroker');

const start = () =>
  new Promise((resolve, reject) => {
    http.createServer(app.callback()).listen(config.get('port'), err => {
      if (err) return reject(err);
      resolve();
    });
  }); 

const connectMongoPromise = mongoConf.connect(
  config.get('mongoUrl'),
  { logger }
);
const connectRabbitPromise = rabbitConf.connect(
  config.get('rabbitUrl'),
  { logger }
);

Promise.all([connectMongoPromise, connectRabbitPromise])
  .then(() =>
    messageBroker.init(rabbitConf.connection(), config.get('amqpDefinitions'))
  )
  .then(() => start())
  .then(() => {
    logger.info(`Server is running on port ${config.get('port')}`);
  })
  .catch(logger.error);

const shutdown = signal => async err => {
  logger.log(`${signal}...`);
  if (err) logger.error(err.stack || err);

  await mongoConf.close();
  await rabbitConf.close();
  logger.info(`${signal} signal received.`);
};

process.on('SIGTERM', shutdown('SIGNTERM'));
