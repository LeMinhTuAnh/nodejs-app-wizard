const redis = require('redis');

const client = redis.createClient(process.env.REDIS_URL);

client.on('error', err => {
  console.error(error);
});

client.on('ready', () => {
  console.info('[REDIS] redis client is ready');
});

module.exports = { client };
