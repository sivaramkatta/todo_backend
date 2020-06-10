const express = require("express");
const jwt = require("jsonwebtoken");
const queries = require("../utils/queries");
const pool = require("../utils/pool");
require("dotenv").config();

const router = express.Router();

// api to signin
router.post("/signin", (req, res) => {
  const { body } = req;
  pool.query(queries.get_user(body.username, body.password), (error, data) => {
    if (error) {
      res
        .status(500)
        .send({ error: { msg: "Interal Server Error", stack: error } });
    } else {
      const rows = data.rows;
      if (rows.length == 1) {
        const row = rows[0];
        const token = jwt.sign(
          { id: row.id, name: row.name },
          process.env.jwt_secret,
          { expiresIn: "24h" }
        );
        res.json({ data: { token } });
      } else {
        res.status(401).send({
          error: { msg: "No user found with given credentials", stack: error }
        });
      }
    }
  });
});

// api to signup
router.post("/signup", (req, res) => {
  const { body } = req;
  pool.query(
    queries.create_user(body.name, body.username, body.password, body.email),
    error => {
      if (error) {
        res
          .status(500)
          .send({ error: { msg: "Internal Server Error", stack: error } });
      } else {
        pool.query(
          `select id, name from USER_DETAILS where username='${body.username}' and password ='${body.password}';`,
          (inner_error, inner_data) => {
            if (inner_error) {
              res.status(500).send({
                error: { msg: "Internal Server Error", stack: inner_error }
              });
            } else {
              const rows = inner_data.rows;
              if (rows.length == 1) {
                const row = rows[0];
                const token = jwt.sign(
                  { id: row.id, name: row.name },
                  process.env.jwt_secret,
                  { expiresIn: "24h" }
                );
                res.json({ data: { token } });
              }
            }
          }
        );
      }
    }
  );
});

// get user details by id which is public api and by fields which is public api
router.get("/", (req, res) => {
  if (Object.keys(req.query).length > 0) {
    let search = "";
    const { query } = req;
    for (let key in query) {
      if (search === "") {
        search += `${key}='${query[key]}'`;
      } else {
        search += `and ${key}='${query[key]}'`;
      }
    }
    pool.query(queries.get_user_by_field(search), (error, data) => {
      if (error) {
        res
          .status(500)
          .send({ error: { msg: "Internal Server Error", stack: error } });
      } else {
        const rows = data.rows;
        if (rows.length > 0) {
          const row = rows[0];
          res.send({ data: row });
        } else {
          res
            .status(404)
            .send({ error: { msg: "No user found with given credentials" } });
        }
      }
    });
  } else {
    jwt.verify(req.headers.jwt_token, process.env.jwt_secret, function (
      error,
      data
    ) {
      if (error) {
        res.status(401).send({
          error: { msg: error.message, stack: error }
        });
      } else {
        pool.query(queries.get_user_by_id(data.id), (error, data) => {
          if (error) {
            res.status(500).send({
              error: { msg: "Internal server error", stack: error }
            });
          } else {
            const rows = data.rows;
            if (rows.length == 1) {
              const row = rows[0];
              res.send({ data: row });
            } else {
              res.status(404).send({
                error: { msg: "No user found with given credentials" }
              });
            }
          }
        });
      }
    });
  }
});

// protected api to edit user details
router.put("/", (req, res) => {
  jwt.verify(req.headers.jwt_token, process.env.jwt_secret, function (
    error,
    data
  ) {
    if (error) {
      res.status(401).send({
        error: { msg: error.message, stack: error }
      });
    } else {
      const { body } = req;
      let key_value = "";
      for (let key in body) {
        if (key_value === "") {
          key_value += `${key}='${body[key]}'`;
        } else {
          key_value += `, ${key}='${body[key]}'`;
        }
      }
      pool.query(queries.edit_user_by_id(key_value, data.id), error => {
        if (error) {
          res.status(500).send({ error: { msg: error.detail, stack: error } });
        } else {
          pool.query(queries.get_user_by_id(data.id), (error, data) => {
            if (error) {
              res.status(500).send({
                error: { msg: "Internal server error", stack: error }
              });
            } else {
              const rows = data.rows;
              if (rows.length == 1) {
                const row = rows[0];
                res.send({ data: row });
              } else {
                res.status(404).send({
                  error: { msg: "No user found with given credentials" }
                });
              }
            }
          });
        }
      });
    }
  });
});

module.exports = router;
