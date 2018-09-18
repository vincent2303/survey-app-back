"use strict";

var generateToken = function generateToken(req, res, next) {
  req.token = req.user.generateJwt();
  next();
};

module.exports = generateToken;
//# sourceMappingURL=generateToken.js.map