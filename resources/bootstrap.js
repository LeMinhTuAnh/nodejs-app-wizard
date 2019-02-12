const http = require('http');
const config = require('config');
// $__router
const logger = require('./config/logger');
// $__koaConf
// $__mongoConf
const mongoConf = require('./config/mongo.config');
// $__rabbitConf
const rabbitConf = require('./config/rabbit.config');
// $__messageBroker
const messageBroker = require('./config/messageBroker');

// $__startApiServerDeclare

const start = async () => {
  try {
      // $__connectMongoDB
    await mongoConf.connect(config.get('mongoUrl'), {
      logger,
    });
    
    // $__connectRabbitMQ
    await rabbitConf.connect(config.get('rabbitUrl'), {
      logger,
    });
    
    // $__startMessageBroker
    await startMessageBroker(rabbitConf.connection(), config.get('amqpDefinitions'));

    // $__startApiServerExecute

    logger.info(`App is listening on port ${config.get('port')}`)
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

const shutdown = signal => async err => {
  logger.log(`${signal}...`);
  if (err) logger.error(err.stack || err);

  await mongoConf.close();
  await rabbitConf.close();
  logger.info(`${signal} signal received.`);
};

process.on('SIGTERM', shutdown('SIGNTERM'));
