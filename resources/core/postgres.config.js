const { Pool } = require('pg');

let pool;

const connect = pgUrl =>
  new Promise((resolve, reject) => {
    pool = new Pool({ connectionString: pgUrl });
    return resolve(pool);
  });

module.exports = {
  query: query => pool.query(query),
  client: () => pool.connect(),
  connect,
};
