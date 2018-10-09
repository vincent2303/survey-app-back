"use strict";

var express = require('express');

var passport = require('passport');

var router = express.Router(); // Le body Parser permet d'acceder aux variable envoyés dans le body

var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(express.urlencoded({
  extended: false
}));

var morgan = require('morgan');

router.use(morgan('dev')); // Authentification

var loginStrategy = require('../passport-config/adminStrategy');

passport.use(loginStrategy);
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (id, done) {
  done(null, id);
});
router.post('/', passport.authenticate('local', {
  session: true
}), function (req, res) {
  switch (req.user) {
    case "wrongUser":
      res.status(460).send("Wrong username");
      break;

    case "wrongPass":
      res.status(461).send("Wrong password");
      break;

    default:
      req.login(req.user, function (err) {
        console.log("successfull login");
      });
      var serverResponse = {
        success: true,
        admin: {
          pseudo: req.user.dataValues.pseudo
        }
      };
      res.json(serverResponse);
  }
});
module.exports = router;
//# sourceMappingURL=login.js.map