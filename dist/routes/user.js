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

router.post('/updateUser', function (req, res) {
  var newCookie = Object.assign(req.user, req.body.updatedUser);
  req.login(newCookie, function (err) {
    console.log("successfull login: ", newCookie);
  });
  Models.User.updateUser(req.user.id, req.body.updatedUser).then(function () {
    res.status(200).json(req.body.updatedUser);
  });
});
router.get('getToken', function (req, res) {
  Models.Sondage.findOne({
    where: {
      current: true
    }
  }).then(function (sondage) {
    Models.User.findOne({
      where: {
        id: req.user.id
      }
    }).then(function (user) {
      var sondage_id = sondage.dataValues.id;
      var token = user.generateJwt(sondage_id);
      console.log(token);
    });
  });
});
module.exports = router;
//# sourceMappingURL=user.js.map