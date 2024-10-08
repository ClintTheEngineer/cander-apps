const Pool = require('pg').Pool;
require('dotenv').config();

const proConfig = {
    connectionString: process.env.DB_URL
}

const devConfig = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.PORT,
    database: process.env.DATABASE
  });

const pool = new Pool(process.env.NODE_ENV === "production" ? proConfig : devConfig);

module.exports = pool;

