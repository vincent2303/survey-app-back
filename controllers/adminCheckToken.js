const jwt = require('express-jwt');
const env = require("../const");


const checkToken = jwt({
  secret: env.admin_token_secret_key,
});

module.exports = checkToken;
