const express = require("express");
const bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
const pg = require("pg");
const config = require("./config");

const pool = new pg.Pool({
  user: config.pg_user,
  host: config.pg_host,
  database: config.pg_database,
  password: config.pg_password,
  port: config.pg_port
});
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post("/signin", (req, res) => {
  pool.query(
    `select id, name from USER_DETAILS where username='${req.body.username}' and password ='${req.body.password}';`,
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
  pool.query(
    `insert into user_details(name,username,password,email) values ('${req.body.name}','${req.body.username}','${req.body.password}','${req.body.email}');`,
    (errorOne, resultOne) => {
      if (errorOne) {
        res
          .status(500)
          .send({ error: { msg: "Internal server error", stack: errorOne } });
      }
      pool.query(
        `select id, name from USER_DETAILS where username='${req.body.username}' and password ='${req.body.password}';`,
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

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
