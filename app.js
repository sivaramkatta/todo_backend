const express = require("express");
const bodyParser = require("body-parser");
const utils = require("./utils/middleware");
const user_apis = require("./routers/user");
const todo_apis = require("./routers/todo");

require("dotenv").config();
const app = express();

app.use(bodyParser.json());
app.use(utils.getAuthToken);
app.use("/user", user_apis);
app.use("/todo", todo_apis);

app.get("/", (req, res) => {
  res.send("ping received");
});

app.listen(process.env.PORT, () => {
  console.log(`server running on ${process.env.PORT}`);
});
