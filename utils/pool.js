const pg = require("pg");
require("dotenv").config();

let pool = null;
if (process.env.NODE_ENV !== "production") {
  pool = new pg.Pool({
    user: process.env.pg_user,
    host: process.env.pg_host,
    database: process.env.pg_database,
    password: process.env.pg_password,
    port: process.env.pg_port
  });
} else {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

module.exports = pool;
