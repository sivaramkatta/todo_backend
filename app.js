const express = require("express");
const bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
const pg = require("pg");
const config = require("./config");
const utils = require("./middleware");
const queries = require("./queries");

const app = express();
const pool = new pg.Pool({
  user: config.pg_user,
  host: config.pg_host,
  database: config.pg_database,
  password: config.pg_password,
  port: config.pg_port
});

app.use(bodyParser.json());
app.use(utils.getAuthToken);

app.post("/signin", (req, res) => {
  const { body } = req;
  pool.query(
    queries.get_user(body.username, body.password),
    (error, result) => {
      if (error) {
        res
          .status(500)
          .send({ error: { msg: "Internal server error", stack: error } });
      }
      const rows = result.rows;
      if (rows.length == 1) {
        const row = rows[0];
        const token = jwt.sign(
          { id: row.id, name: row.name },
          config.jwt_secret,
          { expiresIn: "24h" }
        );
        res.json({ data: { token } });
      } else {
        res.send({ error: { msg: "Credentials mismatch" } });
      }
    }
  );
});

app.post("/signup", (req, res) => {
  const { body } = req;
  pool.query(
    queries.create_user(body.name, body.username, body.password, body.email),
    errorOne => {
      if (errorOne) {
        res
          .status(500)
          .send({ error: { msg: "Internal server error", stack: errorOne } });
      }
      pool.query(
        `select id, name from USER_DETAILS where username='${body.username}' and password ='${body.password}';`,
        (errorTwo, resultTwo) => {
          if (errorTwo) {
            res.status(500).send({
              error: { msg: "Internal server error", stack: errorTwo }
            });
          }
          const rows = resultTwo.rows;
          if (rows.length == 1) {
            const row = rows[0];
            const token = jwt.sign(
              { id: row.id, name: row.name },
              config.jwt_secret,
              { expiresIn: "24h" }
            );
            res.json({ data: { token } });
          }
        }
      );
    }
  );
});

app.get("/user", (req, res) => {
  jwt.verify(req.headers.jwt_token, config.jwt_secret, function (error, data) {
    if (error) {
      res.status(500).send({
        error: { msg: "Internal server error", stack: error }
      });
    }
    pool.query(queries.get_user_by_id(data.id), (errorOne, result) => {
      if (errorOne) {
        res
          .status(500)
          .send({ error: { msg: "Internal server error", stack: errorOne } });
      }
      const rows = result.rows;
      if (rows.length == 1) {
        const row = rows[0];
        res.send({ data: row });
      } else {
        res.send({ error: { msg: "No user found" } });
      }
    });
  });
});

app.listen(config.port, () => {
  console.log(`server running on ${config.port}`);
});
