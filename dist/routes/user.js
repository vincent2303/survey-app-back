"use strict";

var express = require('express');

var Models = require('../models/index');

var userCheckToken = require('../controllers/userCheckToken');

var router = express.Router(); // front send un get avec header

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
        console.log("question    ", quest);

        if (!thematiqueList.get(question.dataValues.thematique.dataValues.id)) {
          thematiqueList.set(question.dataValues.thematique.dataValues.id, question.dataValues.thematique.dataValues);
        }

        var newList = thematiqueList.get(question.dataValues.thematique.dataValues.id);

        if (newList.questionList) {
          newList.questionList.push(quest);
        } else {
          newList.questionList = [quest];
        }

        console.log("plip    ", newList);
        thematiqueList.set(question.dataValues.thematique.dataValues.id, newList);
      });
      thematiqueList.forEach(function (elem) {
        questionList.push(elem);
      });
      console.log(questionList);
      serverResponse.thematiqueList = questionList; // Si le sondage a déjà été remplis, on renvois les réponses

      if (remplissage) {
        serverResponse.alreadyAnswered = true;
        Models.Reponse.findAll({
          where: {
            remplissage_id: remplissage_id
          }
        }).then(function (reponses) {
          var reponseList = [];
          reponses.forEach(function (reponse) {
            reponseList.push(reponse);
          });
          serverResponse.reponseList = reponseList;
          res.json(serverResponse);
        });
      } else {
        res.json(serverResponse);
      }
    });
  });
}); // front send un post avec header et dans le body un answered_questions (cf index.js)

router.post('/answerSondage', userCheckToken, function (req, res) {
  var _req$user2 = req.user,
      user_id = _req$user2.user_id,
      sondage_id = _req$user2.sondage_id,
      remplissage_id = _req$user2.remplissage_id;
  Models.Remplissage.findById(remplissage_id).then(function (remplissage) {
    if (remplissage) {
      res.send({
        msg: "Vous aviez deja repondue au sondage..."
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
module.exports = router;
//# sourceMappingURL=user.js.map