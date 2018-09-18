const LocalStrategy = require('passport-local').Strategy;

const Admin = require("../models/index").Admin;

const adminLoginStrategy = new LocalStrategy(
  {
    usernameField: "pseudo",
  },
  ((pseudo, password, done) => {
    Admin.findOne({ where: { pseudo: pseudo } }).then((admin) => {
      if (!admin) {
        return done(null, "wrongUser", { message: 'Incorrect username.' });
      }
      if (!admin.validPassword(password)) {
        return done(null, "wrongPass", { message: 'Incorrect password.' });
      }
      admin.salt = undefined;
      admin.hash = undefined;
      return done(null, admin);
    });
  }),
);

module.exports = adminLoginStrategy;