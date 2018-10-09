"use strict";

var express = require('express');

var router = express.Router(); // Le body Parser permet d'acceder aux variable envoyés dans le body

var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(express.urlencoded({
  extended: false
}));

var morgan = require('morgan');

router.use(morgan('dev')); // Récupère les models

var Models = require('../models');

router.use(function (req, res, next) {
  if (!req.isAuthenticated() && req.url !== '/login') {
    res.status(401).json({
      message: 'Not logged in'
    });
  } else {
    next();
  }
}); // --------- Routes protegées-------------
// Get user

router.get('/getUser', function (req, res) {
  Models.User.findOne({
    where: {
      id: req.user.id
    }
  }).then(function (user) {
    res.json(user.dataValues);
  });
});
module.exports = router;
//# sourceMappingURL=user.js.map