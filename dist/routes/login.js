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
      res.status(401).json({
        message: "Wrong username"
      });
      break;

    case "wrongPass":
      res.status(401).json({
        message: "Wrong password"
      });
      break;

    default:
      req.login(req.user, function (err) {
        console.log("successfull login");
      });
      var serverResponse = {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        pseudo: req.user.pseudo,
        email: req.user.email,
        photo: req.user.photo
      };
      res.json(serverResponse);
  }
}); // Check if a user is logged in

router.get('/check', function (req, res) {
  if (req.isAuthenticated()) {
    res.json({
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      pseudo: req.user.pseudo,
      email: req.user.email,
      photo: req.user.photo
    });
  } else {
    res.status(401).json({
      message: 'Not logged in'
    });
  }
}); // Logout the session

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.send("User logged out");
});
module.exports = router;
//# sourceMappingURL=login.js.map