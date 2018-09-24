"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var Sequelize = require('sequelize');

var env = require('../const');

var id_generator = require('../custom_module/id_generator'); // models constructors


var userConstructor = require('./constructor/user');

var adminConstructor = require('./constructor/admin');

var jourSondageConstructor = require('./constructor/jourSondage');

var questionConstructor = require('./constructor/question');

var remplissageConstructor = require('./constructor/remplissage');

var reponseConstructor = require('./constructor/reponse');

var sondageConstructor = require('./constructor/sondage');

var thematiqueConstructor = require('./constructor/thematique');

var commentaireConstructor = require('./constructor/commentaire'); // sequelize connection


var sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}); // Models

var User = userConstructor(sequelize);
var Admin = adminConstructor(sequelize);
var JourSondage = jourSondageConstructor(sequelize);
var Question = questionConstructor(sequelize);
var Remplissage = remplissageConstructor(sequelize);
var Reponse = reponseConstructor(sequelize);
var Sondage = sondageConstructor(sequelize);
var Thematique = thematiqueConstructor(sequelize);
var Commentaire = commentaireConstructor(sequelize); // Foreign keys

Question.belongsTo(Sondage, {
  foreignKey: 'sondage_id',
  targetKey: 'id'
});
JourSondage.belongsTo(Sondage, {
  foreignKey: 'sondage_id',
  targetKey: 'id'
});
Reponse.belongsTo(Question, {
  foreignKey: 'question_id',
  targetKey: 'id'
});
Reponse.belongsTo(Remplissage, {
  foreignKey: 'remplissage_id',
  targetKey: 'id'
});
Remplissage.belongsTo(Sondage, {
  foreignKey: 'sondage_id',
  targetKey: 'id'
});
Remplissage.belongsTo(User, {
  foreignKey: 'user_id',
  targetKey: 'id'
});
Question.belongsTo(Thematique, {
  foreignKey: 'thematique_id',
  targetKey: 'id'
});
Commentaire.belongsTo(Thematique, {
  foreignKey: 'thematique_id',
  targetKey: 'id'
});
Commentaire.belongsTo(Remplissage, {
  foreignKey: 'remplissage_id',
  targetKey: 'id'
});

Admin.prototype.getSondage = function (next) {
  var sondageList = [];
  Sondage.findAll().then(function (sondages) {
    Question.findAll({
      include: [{
        model: Thematique
      }]
    }).then(function (questions) {
      sondages.forEach(function (sondage) {
        var thematiqueList = [];
        questions.forEach(function (question) {
          if (question.dataValues.sondage_id === sondage.dataValues.id) {
            var thema = thematiqueList.filter(function (thematique) {
              return thematique.id === question.dataValues.thematique_id;
            });

            if (thema.length > 0) {
              thema[0].questionList.push({
                id: question.dataValues.id,
                question: question.dataValues.valeur
              });
            } else {
              thematiqueList.push({
                id: question.dataValues.thematique_id,
                name: question.dataValues.thematique.dataValues.name,
                questionList: [{
                  id: question.dataValues.id,
                  question: question.dataValues.valeur
                }]
              });
            }
          }
        });
        sondageList.push({
          id: sondage.dataValues.id,
          name: sondage.dataValues.name,
          thematiqueList: thematiqueList,
          current: sondage.dataValues.current
        });
      });
      next(sondageList);
    });
  });
};

Admin.prototype.createSondage = function (sondage, next) {
  var sondage_id = id_generator();
  Sondage.addSondage(sondage_id, this.pseudo, Date.now(), sondage.name);
  sondage.thematiqueList.forEach(function (thematique) {
    Thematique.findOrCreate({
      where: {
        name: thematique.name
      },
      defaults: {
        name: thematique.name,
        id: id_generator()
      }
    }).spread(function (created_or_found_thematique, created_value) {
      if (created_value) {
        console.log("nouvelle thematique");
      }

      thematique.questionList.forEach(function (question) {
        Question.addQuestion(sondage_id, created_or_found_thematique.id, question.text, question.keyWord);
      });
    });
  });
  next();
};

Admin.prototype.getStatistics = function (next) {
  var statistics = {
    monthSendedSondage: [],
    monthAnsweredSondage: [],
    totalSendedSondage: 0,
    // fait
    totalAnsweredSondage: 0,
    // fait
    todayAnsweredSendedRate: 0,
    // answer/send
    todayAverageSatisfaction: 0,
    weekAverageSatisfaction: []
  };
  var getTotalAnsweredSondage = new Promise(function (resolve) {
    Remplissage.count().then(function (total) {
      resolve(total);
    });
  });
  var getTotalSendedSondage = new Promise(function (resolve) {
    JourSondage.sum('nombre_emission').then(function (total) {
      resolve(total);
    });
  });
  Promise.all([getTotalAnsweredSondage, getTotalSendedSondage]).then(function (statisticTab) {
    var _statisticTab = _slicedToArray(statisticTab, 2),
        totalSendedSondage = _statisticTab[0],
        totalAnsweredSondage = _statisticTab[1];

    next({
      totalSendedSondage: totalSendedSondage,
      totalAnsweredSondage: totalAnsweredSondage
    });
  });
};

User.prototype.findSondage = function (req, next) {
  var _req$user = req.user,
      sondage_id = _req$user.sondage_id,
      remplissage_id = _req$user.remplissage_id;
  var serverResponse = {
    alreadyAnswered: false
  };
  Remplissage.findOne({
    where: {
      id: remplissage_id
    }
  }).then(function (remplissage) {
    Question.findAll({
      include: [{
        model: Thematique
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
      serverResponse.thematiqueList = questionList; // Si le sondage a déjà été remplis, on renvois les réponses

      if (remplissage) {
        serverResponse.alreadyAnswered = true;
        Reponse.findAll({
          where: {
            remplissage_id: remplissage_id
          }
        }).then(function (reponses) {
          Sondage.findOne({
            where: {
              id: sondage_id
            }
          }).then(function (sondage) {
            Commentaire.findAll({
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
              next(serverResponse);
            });
          });
        });
      } else {
        Sondage.findOne({
          where: {
            id: sondage_id
          }
        }).then(function (sondage) {
          serverResponse.sondageName = sondage.dataValues.name;
          next(serverResponse);
        });
      }
    });
  });
}; // input
// const sondage = {
//   remlissage_id: "..."
//   sondage_id: "..",
//   answered_questions: [
//     {
//       question_id: "...",
//       answer: "...",
//     },
//   answered_commentaires: [
//     {
//      thematique_id: "...",
//      answer: "...",
//     },
//   ],
// };
// uniquement les questions auxquelles l'ut a repondue, pas de question sans reponses


User.prototype.answerSondage = function (sondage) {
  var remplissage_id = sondage.remplissage_id;
  Remplissage.addRemplissage(remplissage_id, sondage.sondage_id, this.id, Date.now());
  sondage.answered_questions.forEach(function (question) {
    Reponse.addReponse(remplissage_id, question.question_id, question.answer);
  });
  sondage.answered_commentaires.forEach(function (commentaire) {
    Commentaire.addCommentaire(remplissage_id, commentaire.thematique_id, commentaire.answer);
  });
};

User.prototype.updateSondage = function (sondage) {
  var remplissage_id = sondage.remplissage_id;
  sondage.answered_questions.forEach(function (question) {
    Reponse.findOne({
      where: {
        remplissage_id: remplissage_id,
        question_id: question.question_id
      }
    }).then(function (reponse) {
      Reponse.updateReponse(reponse.dataValues.id, question.answer);
    });
  });
  sondage.answered_commentaires.forEach(function (commentaire) {
    Commentaire.findOne({
      where: {
        remplissage_id: remplissage_id,
        thematique_id: commentaire.thematique_id
      }
    }).then(function (comment) {
      Commentaire.updateCommentaire(comment.dataValues.id, commentaire.answer);
    });
  });
};

var Models = {
  User: User,
  Admin: Admin,
  Sondage: Sondage,
  JourSondage: JourSondage,
  Remplissage: Remplissage,
  Question: Question,
  Reponse: Reponse,
  Thematique: Thematique,
  Commentaire: Commentaire
};
module.exports = Models;
//# sourceMappingURL=index.js.map