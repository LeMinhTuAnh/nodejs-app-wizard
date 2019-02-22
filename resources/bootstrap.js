const http = require('http');
const config = require('config');
const rabbitConf = require('./core/rabbit.core');
const mongoConf = require('./core/mongo.core');
const messageHandler = require('./app/messageHandler');
const messageBroker = require('./core/messageBroker');
const logger = require('./core/logger');

const startApiServer = () =>
  new Promise((resolve, reject) => {
    http.createServer(app.callback()).listen(config.get('port'), err => {
      if (err) return reject(err);
      return resolve();
    });
  });

(async () => {
  try {
    await mongoConf.connect(config.get('mongoUrl'), {
      logger,
    });
    
    await rabbitConf.connect(config.get('rabbitUrl'), {
      logger,
    });
    
    await messageBroker.init(rabbitConf.connection(), config.get('amqpDefinitions'));

    messageBroker.getPublishChannel().addConsumer('queue-name', messageHandler.handleMessage)

    await startApiServer();
    
    logger.info(`App is listening on port ${config.get('port')}`)
  } catch (error) {
    logger.error(error)
    process.kill(process.pid, 'SIGTERM')
  }
})();

const shutdown = signal => async err => {
  logger.log(`${signal}...`);
  if (err) logger.error(err.stack || err);

  await mongoConf.close();
  await rabbitConf.close();
  logger.info(`${signal} signal received.`);
};

process.on('SIGTERM', shutdown('SIGNTERM'));
