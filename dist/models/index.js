"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Sequelize = require('sequelize');

var env = require('../const');

var id_generator = require('../custom_module/id_generator'); // const getCommentaire = require('./dataFetch').getCommentaire;


var Op = Sequelize.Op; // models constructors

var userConstructor = require('./constructor/user');

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
var JourSondage = jourSondageConstructor(sequelize);
var Question = questionConstructor(sequelize);
var Remplissage = remplissageConstructor(sequelize);
var Reponse = reponseConstructor(sequelize);
var Sondage = sondageConstructor(sequelize);
var Thematique = thematiqueConstructor(sequelize);
var Commentaire = commentaireConstructor(sequelize); // // Foreign keys

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
}); // Should change this function by using promises more

User.prototype.getSondage = function () {
  return new Promise(function (resolve) {
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
        resolve(sondageList);
      });
    });
  });
};

var addThematiqueId = function addThematiqueId(thematiqueList, thematiqueListWithId) {
  thematiqueList.forEach(function (thematique) {
    thematiqueListWithId.forEach(function (thematiqueWithId) {
      if (thematiqueWithId.name === thematique.name) {
        thematique.id = thematiqueWithId.id;
      }
    });
  });
  return thematiqueList;
};

User.prototype.createSondage = function (sondage) {
  var _this = this;

  return new Promise(function (resolve) {
    var sondage_id = id_generator();
    Sondage.addSondage(sondage_id, _this.pseudo, Date.now(), sondage.name).then(function () {
      var promises = [];
      sondage.thematiqueList.forEach(function (thematique) {
        promises.push(Thematique.addThematique(thematique.name));
      });
      Promise.all(promises).then(function (thematiqueListWithId) {
        addThematiqueId(sondage.thematiqueList, thematiqueListWithId);
        promises = [];
        sondage.thematiqueList.forEach(function (thematique) {
          thematique.questionList.forEach(function (question) {
            promises.push(Question.addQuestion(sondage_id, thematique.id, question.text, question.keyWord));
          });
        });
        Promise.all(promises).then(function () {
          resolve(sondage_id);
        });
      });
    });
  });
};

User.prototype.getCommentairesJour = function (jour) {
  return new Promise(function (resolve) {
    Commentaire.findAll({
      include: [{
        model: Remplissage,
        where: {
          date: jour
        }
      }, {
        model: Thematique
      }]
    }).then(function (commentaires) {
      var promiseList = [];
      commentaires.forEach(function (commentaire) {
        var promise = new Promise(function (resolveCom) {
          commentaire.dataValues.user = {
            firstName: "",
            lastName: "",
            email: ""
          };
          User.findOne({
            where: {
              id: commentaire.dataValues.remplissage.dataValues.user_id
            }
          }).then(function (user) {
            commentaire.dataValues.user.firstName = user.dataValues.firstName;
            commentaire.dataValues.user.lastName = user.dataValues.lastName;
            commentaire.dataValues.user.email = user.dataValues.email;
            resolveCom();
          });
        });
        promiseList.push(promise);
      });
      Promise.all(promiseList).then(function () {
        console.log("Commentaire for ", jour, " found.");
        resolve(commentaires);
      });
    });
  });
};

User.prototype.getStatisticsSpecific = function (date) {
  var searchDate = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
  return new Promise(function (resolveAll) {
    JourSondage.findOne({
      where: {
        date_emmission: searchDate
      }
    }).then(function (jourSondage) {
      if (!jourSondage) {
        resolveAll("no sondage this day...");
      } else {
        var sondage_id = jourSondage.dataValues.sondage_id;
        var questionList = [];
        var thematiqueIdList = [];
        var remplissageIdList = [];
        var sondage_name = null;
        var promises = [];
        promises.push(new Promise(function (resolve) {
          Question.findAll({
            where: {
              sondage_id: sondage_id
            }
          }).then(function (questionListFound) {
            questionListFound.forEach(function (question) {
              questionList.push(question.dataValues);

              if (!thematiqueIdList.includes(question.dataValues.thematique_id)) {
                thematiqueIdList.push(question.dataValues.thematique_id);
              }
            });
            resolve();
          });
        }));
        promises.push(new Promise(function (resolve) {
          Remplissage.findAll({
            where: {
              sondage_id: sondage_id,
              date: searchDate
            }
          }).then(function (remplissageListFound) {
            remplissageListFound.forEach(function (remplissage) {
              remplissageIdList.push(remplissage.dataValues.id);
            });
            resolve();
          });
        }));
        promises.push(new Promise(function (resolve) {
          Sondage.findOne({
            where: {
              id: sondage_id
            }
          }).then(function (sondage) {
            sondage_name = sondage.dataValues.name;
            resolve();
          });
        }));
        Promise.all(promises).then(function () {
          promises = [];
          var thematiqueList = [];
          var reponseList = [];
          promises.push(new Promise(function (resolve) {
            Thematique.findAll({
              where: {
                id: _defineProperty({}, Op.or, thematiqueIdList)
              }
            }).then(function (thematiqueListFound) {
              thematiqueListFound.forEach(function (thematique) {
                thematiqueList.push(thematique.dataValues);
              });
              resolve();
            });
          }));
          promises.push(new Promise(function (resolve) {
            Reponse.findAll({
              where: {
                remplissage_id: _defineProperty({}, Op.or, remplissageIdList)
              }
            }).then(function (reponses) {
              reponses.forEach(function (reponse) {
                reponseList.push(reponse.dataValues);
              });
              resolve();
            });
          }));
          Promise.all(promises).then(function () {
            // thematiqueId --> { thematiqueName, questionMap }
            // questionMap: questionId --> { keyWord, sum, numberAnswer } 
            var sondageMap = new Map(); // thematiqueId -->  name 

            var thematiqueMap = new Map();
            thematiqueList.forEach(function (thematique) {
              thematiqueMap.set(thematique.id, thematique.name);
              sondageMap.set(thematique.id, {
                thematiqueName: thematique.name,
                questionMap: new Map()
              });
            }); // question ID --> thematiqueId

            var questionToThematique = new Map();
            questionList.forEach(function (question) {
              questionToThematique.set(question.id, question.thematique_id);
              sondageMap.get(question.thematique_id).questionMap.set(question.id, {
                keyWord: question.keyWord,
                sum: 0,
                numberAnswer: 0
              });
            });
            reponseList.forEach(function (reponse) {
              var thematiqueId = questionToThematique.get(reponse.question_id);
              sondageMap.get(thematiqueId).questionMap.get(reponse.question_id).sum += reponse.valeur;
              sondageMap.get(thematiqueId).questionMap.get(reponse.question_id).numberAnswer += 1;
            });
            var sondageResult = {
              name: sondage_name,
              thematiqueList: []
            };
            sondageMap.forEach(function (thematiqueObject) {
              var thematique = {
                name: thematiqueObject.thematiqueName,
                questionList: []
              };
              thematiqueObject.questionMap.forEach(function (questionObject) {
                thematique.questionList.push({
                  keyWord: questionObject.keyWord,
                  avg: questionObject.sum / (questionObject.numberAnswer || 1)
                });
              });
              sondageResult.thematiqueList.push(thematique);
            });
            resolveAll(sondageResult);
          });
        });
      }
    });
  });
};

User.prototype.getStatistics = function (next) {
  var statistics = {
    monthSentSondage: [],
    // fait
    monthAnsweredSondage: [],
    // fait
    totalSentSondage: 0,
    // fait
    totalAnsweredSondage: 0,
    // fait
    totalRate: 0,
    totalSatis: 0,
    todayAnsweredSendedRate: 0,
    // fait
    todayAverageSatisfaction: 0,
    // fait
    monthAverageSatisfaction: [],
    // fait
    weekRate: []
  };
  var getTotalAnsweredSondage = new Promise(function (resolve) {
    Remplissage.count().then(function (total) {
      resolve(total);
    });
  });
  var getTotalSentSondage = new Promise(function (resolve) {
    JourSondage.sum('nombre_emission').then(function (total) {
      resolve(total);
    });
  });
  var getTotalRate = new Promise(function (resolve) {
    Promise.all([getTotalAnsweredSondage, getTotalSentSondage]).then(function (data) {
      var rate = parseFloat((data[0] / data[1]).toFixed(3));
      resolve(rate);
    });
  });
  var getTotalSatis = new Promise(function (resolve) {
    Reponse.sum('valeur').then(function (val) {
      Reponse.count().then(function (total) {
        return resolve(parseFloat((val / total).toFixed(3)));
      });
    });
  });

  var getJourSentSondage = function getJourSentSondage(jour) {
    return new Promise(function (resolve) {
      var jourDate = new Date(jour).toLocaleDateString();
      JourSondage.findOne({
        where: {
          date_emmission: jour
        }
      }).then(function (jsondage) {
        if (jsondage) {
          console.log("On ", jourDate, ", ", jsondage.dataValues.nombre_emission, " mails were sent.");
          resolve(jsondage.dataValues.nombre_emission);
        } else {
          console.log("No mail sent on: ", jourDate);
          resolve(0);
        }
      });
    });
  };

  var getJourAnsweredSondage = function getJourAnsweredSondage(jour) {
    return new Promise(function (resolve) {
      var jourDate = new Date(jour).toLocaleDateString();
      Remplissage.count({
        where: {
          date: jour
        }
      }).then(function (nb) {
        console.log("On ", jourDate, ", ", nb, " sondage were answered.");
        resolve(nb);
      });
    });
  };

  var getMonthSentSondage = new Promise(function (resolve) {
    var intPromises = [];

    for (var i = 0; i < 31; i++) {
      intPromises.push(getJourSentSondage(Date.now() - 86400000 * i));
    }

    Promise.all(intPromises).then(function (data) {
      resolve(data);
    });
  });
  var getMonthAnsweredSondage = new Promise(function (resolve) {
    var intPromises = [];

    for (var i = 0; i < 31; i++) {
      intPromises.push(getJourAnsweredSondage(Date.now() - 86400000 * i));
    }

    Promise.all(intPromises).then(function (data) {
      resolve(data);
    });
  });

  var getDayStatis = function getDayStatis(jour) {
    return new Promise(function (resolve) {
      Reponse.findAll({
        include: [{
          model: Remplissage,
          where: {
            date: jour
          }
        }]
      }).then(function (reps) {
        if (reps.length > 0) {
          var satisfaction = 0;
          reps.forEach(function (rep) {
            satisfaction += rep.dataValues.valeur;
          });
          resolve(parseFloat((satisfaction / reps.length).toFixed(3)));
        } else {
          resolve(0);
        }
      });
    });
  };

  var getDayRate = function getDayRate(jour) {
    return new Promise(function (resolve) {
      Promise.all([getJourAnsweredSondage(jour), getJourSentSondage(jour)]).then(function (data) {
        console.log(data);
        var rate = Number;

        if (data[1] !== 0) {
          rate = parseFloat((data[0] / data[1]).toFixed(3));
        } else {
          rate = 0;
        }

        resolve(rate);
      });
    });
  };

  var getTodayStatis = new Promise(function (resolve) {
    getDayStatis(Date.now()).then(function (data) {
      return resolve(data);
    });
  });
  var getTodayRate = new Promise(function (resolve) {
    getDayRate(Date.now()).then(function (data) {
      return resolve(data);
    });
  });
  var getMonthStatis = new Promise(function (resolve) {
    var intPromises = [];

    for (var i = 0; i < 31; i++) {
      intPromises.push(getDayStatis(Date.now() - 86400000 * i));
    }

    Promise.all(intPromises).then(function (data) {
      resolve(data);
    });
  });
  var getWeekRate = new Promise(function (resolve) {
    var intPromises = [];

    for (var i = 0; i < 8; i++) {
      intPromises.push(getDayRate(Date.now() - 86400000 * i));
    }

    Promise.all(intPromises).then(function (data) {
      resolve(data);
    });
  });
  Promise.all([getTotalAnsweredSondage, getTotalSentSondage, getTotalRate, getTotalSatis, getMonthSentSondage, getMonthAnsweredSondage, getTodayRate, getTodayStatis, getMonthStatis, getWeekRate]).then(function (statisticTab) {
    var _statisticTab = _slicedToArray(statisticTab, 10),
        totalAnsweredSondage = _statisticTab[0],
        totalSentSondage = _statisticTab[1],
        totalRate = _statisticTab[2],
        totalSatis = _statisticTab[3],
        monthSentSondage = _statisticTab[4],
        monthAnsweredSondage = _statisticTab[5],
        todayAnsweredSendedRate = _statisticTab[6],
        todayAverageSatisfaction = _statisticTab[7],
        monthAverageSatisfaction = _statisticTab[8],
        weekRate = _statisticTab[9];

    next({
      totalSentSondage: totalSentSondage,
      totalAnsweredSondage: totalAnsweredSondage,
      totalRate: totalRate,
      totalSatis: totalSatis,
      monthSentSondage: monthSentSondage,
      monthAnsweredSondage: monthAnsweredSondage,
      todayAnsweredSendedRate: todayAnsweredSendedRate,
      todayAverageSatisfaction: todayAverageSatisfaction,
      monthAverageSatisfaction: monthAverageSatisfaction,
      weekRate: weekRate
    });
  });
};

User.prototype.findSondage = function (req) {
  return new Promise(function (resolve) {
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
                resolve(serverResponse);
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
            resolve(serverResponse);
          });
        }
      });
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


User.prototype.answerSondage = function (sondage, simulationDate) {
  var _this2 = this;

  var date = simulationDate || Date.now();
  return new Promise(function (resolve) {
    var remplissage_id = sondage.remplissage_id;
    var sondage_id = sondage.sondage_id;
    Remplissage.addRemplissage(remplissage_id, sondage_id, _this2.id, date).then(function () {
      var promises = [];
      sondage.answered_questions.forEach(function (question_answer) {
        promises.push(Reponse.addReponse(remplissage_id, question_answer.question_id, question_answer.answer));
      });
      sondage.answered_commentaires.forEach(function (commentaire_answer) {
        promises.push(Commentaire.addCommentaire(remplissage_id, commentaire_answer.thematique_id, commentaire_answer.answer));
      });
      Promise.all(promises).then(function () {
        resolve();
      });
    });
  });
};

User.prototype.updateSondage = function (sondage) {
  return new Promise(function (resolve) {
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
        if (comment) {
          Commentaire.updateCommentaire(comment.dataValues.id, commentaire.answer);
        } else {
          Commentaire.addCommentaire(remplissage_id, commentaire.thematique_id, commentaire.answer);
        }
      });
    });
    resolve();
  });
};

var Models = {
  User: User,
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