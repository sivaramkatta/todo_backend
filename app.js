const express = require("express");
const bodyParser = require("body-parser");
const Pool = require("pg").Pool;

const pool = new Pool({
  user: "administrator",
  host: "localhost",
  database: "todo_app",
  password: "password",
  port: 5432
});

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get("/", (request, response) => {
  pool.query("SELECT * FROM user_details", (error, results) => {
    if (error) {
      throw error;
    }
    console.log("result is", results.rows);
    response.json({ info: "Node.js, Express, and Postgres API" });
  });
});

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
