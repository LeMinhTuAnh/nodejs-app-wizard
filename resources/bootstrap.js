const http = require('http');
const config = require('config');
const rabbitConf = require('./rabbit.config');
const messageHandler = require('./messageHandler');
const appConf = require('./app.config');
const messageBroker = require('./messageBroker');
const logger = require('./logger');

const startApiServer = () =>
  new Promise((resolve, reject) => {
    http.createServer(app.callback()).listen(config.get('port'), err => {
      if (err) return reject(err);
      return resolve();
    });
  });

const start = async () => {
  try {
    await mongoConf.connect(config.get('mongoUrl'), {
      logger,
    });
    
    await rabbitConf.connect(config.get('rabbitUrl'), {
      logger,
    });
    
    await startMessageBroker(rabbitConf.connection(), config.get('amqpDefinitions'));

     await startApiServer();
    
    logger.info(`App is listening on port ${config.get('port')}`)
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

start();

const shutdown = signal => async err => {
  logger.log(`${signal}...`);
  if (err) logger.error(err.stack || err);

  await mongoConf.close();
  await rabbitConf.close();
  logger.info(`${signal} signal received.`);
};

process.on('SIGTERM', shutdown('SIGNTERM'));
