const amqp = require('amqplib/callback_api');

const state = {
  /**
   * @type {amqp.connection}
   */
  connection: null,
  connected: true,
};

const TAG = '[AMQP]';

/**
 * Init AMQP connection
 * @param {*} amqpUrl
 * @param {*} options
 */
const connect = (amqpUrl, { logger = console }) =>
  new Promise((resolve, reject) => {
    amqp.connect(
      amqpUrl,
      (err, conn) => {
        if (err) {
          logger.error(`${TAG} unable to connect to ${amqpUrl}`);
          return reject(err);
        }
        logger.info(`${TAG} connected to ${amqpUrl}`);
        state.connection = conn;
        state.connected = true;

        conn.on('close', () => {
          logger.console.warn(`${TAG} connection close`);
        });
        return resolve(state.connection);
      }
    );
  });

module.exports = {
  connect,
  connection: () => state.connection,
};
