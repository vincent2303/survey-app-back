"use strict";

var express = require('express');

var router = express.Router(); // Le body Parser permet d'acceder aux variable envoyés dans le body

var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(express.urlencoded({
  extended: false
}));

var morgan = require('morgan');

router.use(morgan('dev'));

var Models = require('../models');

var userCheckToken = require('../controllers/userCheckToken'); // front send un get avec header


router.get('/getSondage', userCheckToken, function (req, res) {
  Models.User.findOne({
    where: {
      id: req.user.user_id
    }
  }).then(function (user) {
    user.findSondage(req).then(function (serverResponse) {
      console.log("Sending current sondage to front");
      res.status(200).json(serverResponse);
    });
  });
}); // front send un post avec header et dans le body un answered_questions (cf index.js)

router.post('/answerSondage', userCheckToken, function (req, res) {
  var _req$user = req.user,
      user_id = _req$user.user_id,
      sondage_id = _req$user.sondage_id,
      remplissage_id = _req$user.remplissage_id;
  Models.Remplissage.findById(remplissage_id).then(function (remplissage) {
    if (remplissage) {
      Models.User.findById(user_id).then(function (user) {
        var sondage = {
          sondage_id: sondage_id,
          remplissage_id: remplissage_id,
          answered_questions: req.body.answered_questions,
          answered_commentaires: req.body.answered_commentaires
        };
        user.updateSondage(sondage).then(function () {
          console.log(req.user.firstName, " already answered and changed his answers");
          res.status(200).send({
            msg: "Merci d'avoir modifier votre reponse !"
          });
        });
      });
    } else {
      Models.User.findById(user_id).then(function (user) {
        var sondage = {
          sondage_id: sondage_id,
          remplissage_id: remplissage_id,
          answered_questions: req.body.answered_questions,
          answered_commentaires: req.body.answered_commentaires
        };
        user.answerSondage(sondage).then(function () {
          console.log("New remplissage submitted by: ", req.user.firstName);
          res.status(200).send({
            msg: "Merci d'avoir repondu au sondage !"
          });
        });
      });
    }
  });
});
router.post('/changeFreq', userCheckToken, function (req, res) {
  console.log(typeof req.body.newIntensity === "number");

  if (typeof req.body.newIntensity === "number") {
    Models.User.update({
      mailIntensity: req.body.newIntensity
    }, {
      where: {
        id: req.user.user_id
      }
    }).then(res.status(200).send({
      msg: "Mail Intensity changed"
    }));
  }
});
router.get('/getMailIntensity', userCheckToken, function (req, res) {
  Models.User.findOne({
    where: {
      id: req.user.user_id
    }
  }).then(function (user) {
    res.status(200).json({
      mailIntensity: user.dataValues.mailIntensity
    });
  });
});
router.use(function (err, req, res, next) {
  console.log("error: ", err.name);

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      message: 'Unauthorized. Invalid token!'
    });
  }
});
module.exports = router;
//# sourceMappingURL=survey.js.map