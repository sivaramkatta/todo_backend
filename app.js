const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config");
const utils = require("./utils/middleware");
const user_apis = require("./routers/user");
const todo_apis = require("./routers/todo");

const app = express();

app.use(bodyParser.json());
app.use(utils.getAuthToken);
app.use("/user", user_apis);
app.use("/todo", todo_apis);

app.listen(config.port, () => {
  console.log(`server running on ${config.port}`);
});
