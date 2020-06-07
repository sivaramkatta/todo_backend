const getAuthToken = (req, res, next) => {
  if (req.headers.authorization) {
    const jwt_token = req.headers.authorization.split(" ")[1];
    req.headers.jwt_token = jwt_token;
  }
  next();
};

module.exports = {
  getAuthToken
};
