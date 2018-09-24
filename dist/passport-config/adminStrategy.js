"use strict";

var LocalStrategy = require('passport-local').Strategy;

var Admin = require("../models/index").Admin;

var adminLoginStrategy = new LocalStrategy({
  usernameField: "pseudo"
}, function (pseudo, password, done) {
  Admin.findOne({
    where: {
      pseudo: pseudo
    }
  }).then(function (admin) {
    if (!admin) {
      return done(null, "wrongUser", {
        message: 'Incorrect username.'
      });
    }

    if (!admin.validPassword(password)) {
      return done(null, "wrongPass", {
        message: 'Incorrect password.'
      });
    }

    admin.salt = undefined;
    admin.hash = undefined;
    return done(null, admin);
  });
});
module.exports = adminLoginStrategy;
//# sourceMappingURL=adminStrategy.js.map