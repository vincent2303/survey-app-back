const LocalStrategy = require('passport-local').Strategy;

const User = require("../models").User;

const userLoginStrategy = new LocalStrategy(
  {
    usernameField: "email",
  },
  ((email, password, done) => {
    User.findOne({ where: { email: email } }).then((user) => {
      if (!user) {
        return done(null, "wrongUser", { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, "wrongPass", { message: 'Incorrect password.' });
      }
      user.salt = undefined;
      user.hash = undefined;
      return done(null, user);
    });
  }),
);

module.exports = userLoginStrategy;