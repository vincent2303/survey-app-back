const LocalStrategy = require('passport-local').Strategy;

const User = require("../models/index").User;

const loginStrategy = new LocalStrategy(
  {
    usernameField: "pseudo",
  },
  ((pseudo, password, done) => {
    User.findOne({ where: { pseudo: pseudo } }).then((user) => {
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

module.exports = loginStrategy;