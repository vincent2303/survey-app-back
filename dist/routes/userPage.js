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

router.use(morgan('dev')); // Récupère les models

var Models = require('../models/index'); // Authentification


var userLoginStrategy = require('../passport-config/userStrategy');

passport.use('local.user', userLoginStrategy);
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (id, done) {
  done(null, id);
});
router.use(function (req, res, next) {
  if (!req.isAuthenticated() && req.url !== '/login') {
    res.status(401).json({
      message: 'Unauthorized. User not logged in!'
    });
  } else {
    next();
  }
});
router.post('/login', passport.authenticate('local.user', {
  session: true
}), function (req, res) {
  switch (req.user) {
    case "wrongUser":
      res.status(460).send("Wrong email");
      break;

    case "wrongPass":
      res.status(461).send("Wrong password");
      break;

    default:
      console.log("Correct authentification: ", req.user.dataValues.pseudo);
      req.login(req.user, function () {
        console.log('Inside req.login() callback');
        console.log("req.session.passport: ".concat(JSON.stringify(req.session.passport)));
        console.log("req.user: ".concat(JSON.stringify(req.user)));
      });
      var serverResponse = {
        success: true,
        user: {
          email: req.user.dataValues.email
        }
      };
      res.json(serverResponse);
  }
}); // --------- Routes protegées-------------
// Logout the session

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.send("User logged out");
}); // Get user

router.get('/getUser', function (req, res) {
  Models.User.findOne({
    where: {
      id: req.user
    }
  }).then(function (user) {
    res.json(user.dataValues.firstName);
  });
});
module.exports = router;
//# sourceMappingURL=userPage.js.map