"use strict";

var LocalStrategy = require('passport-local').Strategy;

var User = require("../models/index").User;

var loginStrategy = new LocalStrategy({
  usernameField: "pseudo"
}, function (pseudo, password, done) {
  User.findOne({
    where: {
      pseudo: pseudo
    }
  }).then(function (user) {
    if (!user) {
      return done(null, "wrongUser", {
        message: 'Incorrect username.'
      });
    }

    if (!user.validPassword(password)) {
      return done(null, "wrongPass", {
        message: 'Incorrect password.'
      });
    }

    user.salt = undefined;
    user.hash = undefined;
    return done(null, user);
  });
});
module.exports = loginStrategy;
//# sourceMappingURL=adminStrategy.js.map