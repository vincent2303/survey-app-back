"use strict";

var express = require('express');

var router = express.Router();

var fs = require('fs'); // Le body Parser permet d'acceder aux variable envoyés dans le body


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
    console.log("Modified cookie: ", newCookie);
  });
  Models.User.updateUser(req.user.id, req.body.updatedUser).then(function () {
    res.status(200).json(req.body.updatedUser);
  });
});
router.post('/updatePhoto', function (req, res) {
  var base64Data = req.body.photo.replace(/^data:image\/jpeg;base64,/, "");
  console.log(base64Data);
  fs.writeFile("./public/user/photo/".concat(req.user.pseudo), base64Data, 'base64', function (err) {
    if (err) {
      console.log(err);
    } else {
      Models.User.update({
        photo: "/user/photo/".concat(req.user.pseudo, ".jpg")
      }, {
        where: {
          id: req.user.id
        }
      }).then(function () {
        var newCookie = Object.assign(req.user, {
          photo: "/user/photo/".concat(req.user.pseudo)
        });
        req.login(newCookie, function (err) {
          console.log("Modified cookie: ", newCookie);
        });
        res.status(200).json({
          photo: "/user/photo/".concat(req.user.pseudo)
        });
      });
    }
  });
});
router.get('/getToken', function (req, res) {
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
      res.status(200).send({
        token: token
      });
    });
  });
});
module.exports = router;
//# sourceMappingURL=user.js.map