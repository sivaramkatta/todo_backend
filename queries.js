const get_user = (username, password) =>
  `select id, name, email, username from USER_DETAILS where username='${username}' and password ='${password}';`;
const create_user = (name, username, password, email) =>
  `insert into user_details(name,username,password,email) values ('${name}','${username}','${password}','${email}');`;
const get_user_by_id = id =>
  `select id, name, email, username from USER_DETAILS where id='${id}';`;
const get_user_by_field = string =>
  `select id, name, email, username from USER_DETAILS where ${string}`;
module.exports = {
  get_user,
  create_user,
  get_user_by_id,
  get_user_by_field
};
