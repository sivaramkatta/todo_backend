const express = require("express");
const jwt = require("jsonwebtoken");
const queries = require("../utils/queries");
const pool = require("../utils/pool");
require("dotenv").config();

const router = express.Router();

//protected api to get todo list of given date
router.get("/", (req, res) => {
  jwt.verify(req.headers.jwt_token, process.env.jwt_secret, (error, data) => {
    if (error) {
      res.status(401).send({
        error: { msg: error.message, stack: error }
      });
    } else {
      const {
        query: { date }
      } = req;
      pool.query(queries.get_todos(data.id, date), (errror, data) => {
        if (errror) {
          res
            .status(500)
            .send({ error: { msg: errror.detail, stack: errror } });
        } else {
          res.send({ data: data.rows });
        }
      });
    }
  });
});

// protected api to add todo in given date
router.post("/", (req, res) => {
  jwt.verify(req.headers.jwt_token, process.env.jwt_secret, (error, data) => {
    if (error) {
      res.status(401).send({
        error: { msg: error.message, stack: error }
      });
    } else {
      const {
        body: { date, description }
      } = req;
      pool.query(queries.add_todo(data.id, date, description), errror => {
        if (errror) {
          res
            .status(500)
            .send({ error: { msg: errror.detail, stack: errror } });
        } else {
          pool.query(queries.get_todos(data.id, date), (error, data) => {
            if (error) {
              res.status(500).send({
                error: { msg: error.detail, stack: errror }
              });
            } else {
              res.send({ data: data.rows });
            }
          });
        }
      });
    }
  });
});

//public api to delete todo entry
router.delete("/:id", (req, res) => {
  pool.query(queries.delete_todos(req.params.id), error => {
    if (error) {
      res.status(500).send({
        error: { msg: error.detail, stack: errror }
      });
    } else {
      res.send({ success: true });
    }
  });
});

//public api to edit todo item using id
router.put("/:id", (req, res) => {
  const { body } = req;
  let string = "";
  for (let key in body) {
    if (string === "") {
      if (key === "done") {
        string += `${key}=${body[key]}`;
      } else {
        string += `${key}='${body[key]}'`;
      }
    } else {
      if (key === "done") {
        string += `, ${key}=${body[key]}`;
      } else {
        string += `, ${key}='${body[key]}'`;
      }
    }
  }
  pool.query(queries.edit_todos(req.params.id, string), error => {
    if (error) {
      res.status(500).send({
        error: { msg: error.detail, stack: error }
      });
    } else {
      pool.query(queries.get_todos_by_id(req.params.id), (error, data) => {
        if (error) {
          res.status(500).send({ error: { msg: error.detail, stack: error } });
        } else {
          res.send({ data: data.rows[0] });
        }
      });
    }
  });
});

module.exports = router;
