"use strict";

var jwt = require('express-jwt');

var env = require("../const"); // check token verifie si token valide et pass le payload dans req.user


var checkToken = jwt({
  secret: env.user_token_secret_key
});
module.exports = checkToken;
//# sourceMappingURL=userCheckToken.js.map