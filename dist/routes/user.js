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

var Models = require('../models/index');

var userCheckToken = require('../controllers/userCheckToken'); // front send un get avec header


router.get('/getSondage', userCheckToken, function (req, res) {
  var _req$user = req.user,
      sondage_id = _req$user.sondage_id,
      remplissage_id = _req$user.remplissage_id;
  var serverResponse = {
    alreadyAnswered: false
  };
  Models.Remplissage.findOne({
    where: {
      id: remplissage_id
    }
  }).then(function (remplissage) {
    Models.Question.findAll({
      include: [{
        model: Models.Thematique
      }],
      where: {
        sondage_id: sondage_id
      }
    }).then(function (questions) {
      var questionList = [];
      var thematiqueList = new Map();
      questions.forEach(function (question) {
        var quest = JSON.parse(JSON.stringify(question));
        delete quest.thematique;

        if (!thematiqueList.get(question.dataValues.thematique.dataValues.id)) {
          thematiqueList.set(question.dataValues.thematique.dataValues.id, question.dataValues.thematique.dataValues);
        }

        var newList = thematiqueList.get(question.dataValues.thematique.dataValues.id);

        if (newList.questionList) {
          newList.questionList.push(quest);
        } else {
          newList.questionList = [quest];
        }

        thematiqueList.set(question.dataValues.thematique.dataValues.id, newList);
      });
      thematiqueList.forEach(function (elem) {
        questionList.push(elem);
      });
      serverResponse.thematiqueList = questionList;
      console.log(remplissage_id); // Si le sondage a déjà été remplis, on renvois les réponses

      if (remplissage) {
        serverResponse.alreadyAnswered = true;
        Models.Reponse.findAll({
          where: {
            remplissage_id: remplissage_id
          }
        }).then(function (reponses) {
          Models.Sondage.findOne({
            where: {
              id: sondage_id
            }
          }).then(function (sondage) {
            Models.Commentaire.findAll({
              where: {
                remplissage_id: remplissage_id
              }
            }).then(function (commentaires) {
              serverResponse.sondageName = sondage.dataValues.name;
              var reponseList = [];
              var commentaireList = [];
              reponses.forEach(function (reponse) {
                reponseList.push(reponse);
              });
              commentaires.forEach(function (commentaire) {
                commentaireList.push(commentaire);
              });
              serverResponse.reponseList = reponseList;
              serverResponse.commentaireList = commentaireList;
              res.json(serverResponse);
            });
          });
        });
      } else {
        Models.Sondage.findOne({
          where: {
            id: sondage_id
          }
        }).then(function (sondage) {
          serverResponse.sondageName = sondage.dataValues.name;
          res.json(serverResponse);
        });
      }
    });
  });
}); // front send un post avec header et dans le body un answered_questions (cf index.js)

router.post('/answerSondage', userCheckToken, function (req, res) {
  var _req$user2 = req.user,
      user_id = _req$user2.user_id,
      sondage_id = _req$user2.sondage_id,
      remplissage_id = _req$user2.remplissage_id;
  console.log(req.body.answered_questions);
  Models.Remplissage.findById(remplissage_id).then(function (remplissage) {
    if (remplissage) {
      Models.User.findById(user_id).then(function (user) {
        var sondage = {
          sondage_id: sondage_id,
          remplissage_id: remplissage_id,
          answered_questions: req.body.answered_questions,
          answered_commentaires: req.body.answered_commentaires
        };
        user.updateSondage(sondage);
        res.status(200).send({
          msg: "merci d'avoir modifier votre reponse :)"
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
        user.answerSondage(sondage);
        res.status(200).send({
          msg: "merci d'avoir repondue :)"
        });
      });
    }
  });
});
router.post('/changeFreq', userCheckToken, function (req, res) {
  if (typeof req.body.newIntensity === "number") {
    Models.User.update({
      mailIntensity: req.body.newIntensity
    }, {
      where: req.body.user_id
    }).then(res.send({
      msg: "Mail Intensity changed"
    }));
  }
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
//# sourceMappingURL=user.js.map