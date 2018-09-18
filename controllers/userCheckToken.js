const jwt = require('express-jwt');
const env = require("../const");
// check token verifie si token valide et pass le payload dans req.user
const checkToken = jwt({
  secret: env.user_token_secret_key,
});

module.exports = checkToken;