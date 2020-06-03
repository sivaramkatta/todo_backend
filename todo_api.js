const express = require("express");
const pg = require("pg");
const config = require("./config");
const queries = require("./queries");
var jwt = require("jsonwebtoken");

const router = express.Router();
const pool = new pg.Pool({
  user: config.pg_user,
  host: config.pg_host,
  database: config.pg_database,
  password: config.pg_password,
  port: config.pg_port
});

//protected api to get todo list of given date
router.get("/", (req, res) => {
  jwt.verify(
    req.headers.jwt_token,
    config.jwt_secret,
    (auth_error, auth_data) => {
      if (auth_error) {
        res.status(500).send({
          error: { msg: "Internal server error", stack: auth_error }
        });
      } else {
        const {
          query: { date }
        } = req;
        pool.query(queries.get_todos(auth_data.id, date), (errror, data) => {
          if (errror) {
            res
              .status(500)
              .send({ error: { msg: errror.detail, stack: errror } });
          } else {
            res.send({ data: data.rows });
          }
        });
      }
    }
  );
});

// protected api to add todo in given date
router.post("/", (req, res) => {
  jwt.verify(
    req.headers.jwt_token,
    config.jwt_secret,
    (auth_error, auth_data) => {
      if (auth_error) {
        res.status(500).send({
          error: { msg: "Internal server error", stack: auth_error }
        });
      } else {
        const {
          body: { date, description }
        } = req;
        pool.query(
          queries.add_todo(auth_data.id, date, description),
          errror => {
            if (errror) {
              res
                .status(500)
                .send({ error: { msg: errror.detail, stack: errror } });
            } else {
              pool.query(
                queries.get_todos(auth_data.id, date),
                (errror_res, data_res) => {
                  if (errror_res) {
                    res.status(500).send({
                      error: { msg: errror_res.detail, stack: errror }
                    });
                  } else {
                    res.send({ data: data_res.rows });
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

//public api to delete todo entry
router.delete("/:id", (req, res) => {
  console.log(req.params);
  pool.query(queries.delete_todos(req.params.id), (errror_res, data_res) => {
    if (errror_res) {
      res.status(500).send({
        error: { msg: errror_res.detail, stack: errror }
      });
    } else {
      res.send({ success: true });
    }
  });
});

module.exports = router;
