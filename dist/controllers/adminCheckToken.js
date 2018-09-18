"use strict";

var jwt = require('express-jwt');

var env = require("../const");

var checkToken = jwt({
  secret: env.admin_token_secret_key
});
module.exports = checkToken;
//# sourceMappingURL=adminCheckToken.js.map