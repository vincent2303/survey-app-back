"use strict";

var LocalStrategy = require('passport-local').Strategy;

var User = require("../models").User;

var userLoginStrategy = new LocalStrategy({
  usernameField: "email"
}, function (email, password, done) {
  User.findOne({
    where: {
      email: email
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
module.exports = userLoginStrategy;
//# sourceMappingURL=userStrategy.js.map