const get_user = (username, password) =>
  `select id, name, email, username from USER_DETAILS where username='${username}' and password ='${password}';`;
const create_user = (name, username, password, email) =>
  `insert into user_details(name,username,password,email) values ('${name}','${username}','${password}','${email}');`;
const get_user_by_id = id =>
  `select id, name, email, username, password from USER_DETAILS where id='${id}';`;
const get_user_by_field = string =>
  `select id, name, email, username from USER_DETAILS where ${string}`;
const edit_user_by_id = (key_value, id) =>
  `update user_details set ${key_value} where id='${id}'`;

// todo queries
const get_todos = (id, date) =>
  `select * from todo_details where user_id='${id}' and todo_date='${date}'`;
const add_todo = (id, date, description) =>
  `insert into todo_details  (user_id ,todo_date,description) values ('${id}','${date}','${description}')`;
const delete_todos = id => `delete from todo_details where id=${id}`;
const edit_todos = (id, edit_string) =>
  `update todo_details set ${edit_string} where id=${id}`;
const get_todos_by_id = id => `select * from todo_details where id=${id}`;

module.exports = {
  get_user,
  create_user,
  get_user_by_id,
  get_user_by_field,
  edit_user_by_id,
  get_todos,
  add_todo,
  delete_todos,
  edit_todos,
  get_todos_by_id
};
