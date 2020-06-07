const pg = require("pg");
const config = require("../config");

const pool = new pg.Pool({
  user: config.pg_user,
  host: config.pg_host,
  database: config.pg_database,
  password: config.pg_password,
  port: config.pg_port
});

module.exports = pool;
