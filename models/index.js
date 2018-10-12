const Sequelize = require('sequelize');
const env = require('../const');
const id_generator = require('../custom_module/id_generator');
// const getCommentaire = require('./dataFetch').getCommentaire;

const Op = Sequelize.Op;

// models constructors
const userConstructor = require('./constructor/user');
const jourSondageConstructor = require('./constructor/jourSondage');
const questionConstructor = require('./constructor/question');
const remplissageConstructor = require('./constructor/remplissage');
const reponseConstructor = require('./constructor/reponse');
const sondageConstructor = require('./constructor/sondage');
const thematiqueConstructor = require('./constructor/thematique');
const commentaireConstructor = require('./constructor/commentaire');

// sequelize connection
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Models
const User = userConstructor(sequelize);
const JourSondage = jourSondageConstructor(sequelize);
const Question = questionConstructor(sequelize);
const Remplissage = remplissageConstructor(sequelize);
const Reponse = reponseConstructor(sequelize);
const Sondage = sondageConstructor(sequelize);
const Thematique = thematiqueConstructor(sequelize);
const Commentaire = commentaireConstructor(sequelize);

// // Foreign keys
Question.belongsTo(Sondage, { foreignKey: 'sondage_id', targetKey: 'id' });
JourSondage.belongsTo(Sondage, { foreignKey: 'sondage_id', targetKey: 'id' });
Reponse.belongsTo(Question, { foreignKey: 'question_id', targetKey: 'id' });
Reponse.belongsTo(Remplissage, { foreignKey: 'remplissage_id', targetKey: 'id' });
Remplissage.belongsTo(Sondage, { foreignKey: 'sondage_id', targetKey: 'id' });
Remplissage.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
Question.belongsTo(Thematique, { foreignKey: 'thematique_id', targetKey: 'id' });
Commentaire.belongsTo(Thematique, { foreignKey: 'thematique_id', targetKey: 'id' });
Commentaire.belongsTo(Remplissage, { foreignKey: 'remplissage_id', targetKey: 'id' });

// Should change this function by using promises more
User.prototype.getSondage = function () {
  return new Promise((resolve) => {
    const sondageList = [];
    Sondage.findAll().then((sondages) => {
      Question.findAll({
        include: [{
          model: Thematique,
        }],
      }).then((questions) => {
        sondages.forEach((sondage) => {
          const thematiqueList = [];
          questions.forEach((question) => {
            if (question.dataValues.sondage_id === sondage.dataValues.id) {
              const thema = thematiqueList.filter(
                thematique => thematique.id === question.dataValues.thematique_id,
              );
              if (thema.length > 0) {
                thema[0].questionList.push({
                  id: question.dataValues.id, 
                  question: question.dataValues.valeur,
                });
              } else {
                thematiqueList.push({
                  id: question.dataValues.thematique_id,
                  name: question.dataValues.thematique.dataValues.name,
                  questionList: [{
                    id: question.dataValues.id, 
                    question: question.dataValues.valeur,
                  }],
                });
              }
            }
          });
          sondageList.push({
            id: sondage.dataValues.id, 
            name: sondage.dataValues.name,
            thematiqueList: thematiqueList,
            current: sondage.dataValues.current,
          });
        });
        resolve(sondageList);
      });
    });
  });
};

const addThematiqueId = function (thematiqueList, thematiqueListWithId) {
  thematiqueList.forEach((thematique) => {
    thematiqueListWithId.forEach((thematiqueWithId) => {
      if (thematiqueWithId.name === thematique.name) {
        thematique.id = thematiqueWithId.id;
      }
    });
  });
  return thematiqueList;
};

User.prototype.createSondage = function (sondage) {
  return new Promise((resolve) => {
    const sondage_id = id_generator();
    Sondage.addSondage(sondage_id, this.pseudo, Date.now(), sondage.name).then(() => {
      let promises = [];
      sondage.thematiqueList.forEach((thematique) => {
        promises.push(Thematique.addThematique(thematique.name));
      });
      Promise.all(promises).then((thematiqueListWithId) => {
        addThematiqueId(sondage.thematiqueList, thematiqueListWithId);
        promises = [];
        sondage.thematiqueList.forEach((thematique) => {
          thematique.questionList.forEach((question) => {
            promises.push(Question.addQuestion(
              sondage_id, thematique.id, question.text, question.keyWord,
            ));
          });
        });
        Promise.all(promises).then(() => { resolve(sondage_id); });
      });
    });
  });
};

User.prototype.getCommentairesJour = function (jour) {
  return new Promise((resolve) => {
    Commentaire.findAll({
      include: [{
        model: Remplissage,
        where: { date: jour },
      },
      {
        model: Thematique,
      },
      ],
    }).then((commentaires) => {
      const promiseList = [];
      commentaires.forEach((commentaire) => {
        const promise = new Promise((resolveCom) => {
          commentaire.dataValues.user = {
            firstName: "",
            lastName: "",
            email: "",
          };
          User.findOne({ where: { id: commentaire.dataValues.remplissage.dataValues.user_id } })
            .then((user) => {
              commentaire.dataValues.user.firstName = user.dataValues.firstName;
              commentaire.dataValues.user.lastName = user.dataValues.lastName;
              commentaire.dataValues.user.email = user.dataValues.email;
              resolveCom();
            });
        });
        promiseList.push(promise);
      });
      Promise.all(promiseList).then(() => {
        console.log("Commentaire for ", jour, " found.");
        resolve(commentaires);
      });
    });
  });
};

User.prototype.getStatisticsSpecific = function (date) {
  const searchDate = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
  return new Promise(function (resolveAll) {
    JourSondage.findOne({ where: { date_emmission: searchDate } }).then((jourSondage) => {
      if (!jourSondage) {
        resolveAll("no sondage this day...");
      } else {
        const sondage_id = jourSondage.dataValues.sondage_id;
        const questionList = [];
        const thematiqueIdList = [];
        const remplissageIdList = [];
        let sondage_name = null;
        let promises = [];
        promises.push(new Promise(function (resolve) {
          Question.findAll({ where: { sondage_id: sondage_id } }).then((questionListFound) => {
            questionListFound.forEach((question) => {
              questionList.push(question.dataValues);
              if (!thematiqueIdList.includes(question.dataValues.thematique_id)) {
                thematiqueIdList.push(question.dataValues.thematique_id);
              }
            });
            resolve();
          });
        }));
        promises.push(new Promise(function (resolve) {
          Remplissage.findAll({ where: { sondage_id: sondage_id, date: searchDate } }).then((remplissageListFound) => {
            remplissageListFound.forEach((remplissage) => {
              remplissageIdList.push(remplissage.dataValues.id);
            });
            resolve();
          });
        }));
        promises.push(new Promise(function (resolve) {
          Sondage.findOne({ where: { id: sondage_id } }).then((sondage) => {
            sondage_name = sondage.dataValues.name;
            resolve();
          });
        }));
        Promise.all(promises).then(() => {
          promises = [];
          const thematiqueList = [];
          const reponseList = [];
          promises.push(new Promise(function (resolve) {
            Thematique.findAll({ where: { id: { [Op.or]: thematiqueIdList } } }).then((thematiqueListFound) => {
              thematiqueListFound.forEach((thematique) => {
                thematiqueList.push(thematique.dataValues);
              });
              resolve();
            });
          }));
          promises.push(new Promise(function (resolve) {
            Reponse.findAll({ where: { remplissage_id: { [Op.or]: remplissageIdList } } }).then(((reponses) => {
              reponses.forEach((reponse) => {
                reponseList.push(reponse.dataValues);
              });
              resolve();
            }));
          }));
          Promise.all(promises).then(() => {
            // thematiqueId --> { thematiqueName, questionMap }
            // questionMap: questionId --> { keyWord, sum, numberAnswer } 
            const sondageMap = new Map();
            // thematiqueId -->  name 
            const thematiqueMap = new Map();
            thematiqueList.forEach((thematique) => {
              thematiqueMap.set(thematique.id, thematique.name);
              sondageMap.set(thematique.id, { thematiqueName: thematique.name, questionMap: new Map() });
            });
            // question ID --> thematiqueId
            const questionToThematique = new Map();
            questionList.forEach((question) => {
              questionToThematique.set(question.id, question.thematique_id);
              sondageMap.get(question.thematique_id).questionMap.set(question.id, { keyWord: question.keyWord, sum: 0, numberAnswer: 0 });
            });
            reponseList.forEach((reponse) => {
              const thematiqueId = questionToThematique.get(reponse.question_id);
              sondageMap.get(thematiqueId).questionMap.get(reponse.question_id).sum += reponse.valeur;
              sondageMap.get(thematiqueId).questionMap.get(reponse.question_id).numberAnswer += 1;
            });
            const sondageResult = {
              name: sondage_name,
              thematiqueList: [],
            };
            sondageMap.forEach((thematiqueObject) => {
              const thematique = {
                name: thematiqueObject.thematiqueName,
                questionList: [],
              };
              thematiqueObject.questionMap.forEach((questionObject) => {
                thematique.questionList.push({
                  keyWord: questionObject.keyWord,
                  avg: questionObject.sum / (questionObject.numberAnswer || 1),
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
  const statistics = {
    monthSentSondage: [], // fait
    monthAnsweredSondage: [], // fait
    totalSentSondage: 0, // fait
    totalAnsweredSondage: 0, // fait
    totalRate: 0,
    totalSatis: 0,
    todayAnsweredSendedRate: 0, // fait
    todayAverageSatisfaction: 0, // fait
    monthAverageSatisfaction: [], // fait
    weekRate: [],

  };
  
  const getTotalAnsweredSondage = new Promise(function (resolve) {
    Remplissage.count().then((total) => {
      resolve(total);
    });
  });

  const getTotalSentSondage = new Promise(function (resolve) {
    JourSondage.sum('nombre_emission').then((total) => {
      resolve(total);
    });
  });

  const getTotalRate = new Promise((resolve) => {
    Promise.all([getTotalAnsweredSondage, getTotalSentSondage])
      .then(((data) => {
        const rate = parseFloat((data[0] / data[1]).toFixed(3));
        resolve(rate);
      }));
  });

  const getTotalSatis = new Promise((resolve) => {
    Reponse.sum('valeur').then((val) => {
      Reponse.count().then(total => resolve(parseFloat((val / total).toFixed(3))));
    });
  });

  const getJourSentSondage = jour => new Promise((resolve) => {
    const jourDate = new Date(jour).toLocaleDateString();
    JourSondage.findOne({ where: { date_emmission: jour } }).then((jsondage) => {
      if (jsondage) {
        console.log("On ", jourDate, ", ", jsondage.dataValues.nombre_emission, " mails were sent.");
        resolve(jsondage.dataValues.nombre_emission);
      } else {
        console.log("No mail sent on: ", jourDate);
        resolve(0);
      }
    });
  });

  const getJourAnsweredSondage = jour => new Promise((resolve) => {
    const jourDate = new Date(jour).toLocaleDateString();
    Remplissage.count({ where: { date: jour } }).then((nb) => {
      console.log("On ", jourDate, ", ", nb, " sondage were answered.");
      resolve(nb);
    });
  });

  const getMonthSentSondage = new Promise((resolve) => {
    const intPromises = [];
    for (let i = 0; i < 31; i++) {
      intPromises.push(getJourSentSondage(Date.now() - (86400000 * i)));
    }
    Promise.all(intPromises).then((data) => {
      resolve(data);
    });
  });

  const getMonthAnsweredSondage = new Promise((resolve) => {
    const intPromises = [];
    for (let i = 0; i < 31; i++) {
      intPromises.push(getJourAnsweredSondage(Date.now() - (86400000 * i)));
    }
    Promise.all(intPromises).then((data) => {
      resolve(data);
    });
  });

  const getDayStatis = jour => new Promise((resolve) => {
    Reponse.findAll({
      include: [{
        model: Remplissage,
        where: { date: jour },
      }],
    }).then((reps) => {
      if (reps.length > 0) {
        let satisfaction = 0;
        reps.forEach((rep) => {
          satisfaction += rep.dataValues.valeur;
        });
        resolve(parseFloat((satisfaction / reps.length).toFixed(3)));
      } else {
        resolve(0);
      }
    });
  });
  
  const getDayRate = jour => new Promise((resolve) => {
    Promise.all([getJourAnsweredSondage(jour), getJourSentSondage(jour)])
      .then(((data) => {
        console.log(data);
        let rate = Number;
        if (data[1] !== 0) {
          rate = parseFloat((data[0] / data[1]).toFixed(3));
        } else {
          rate = 0;
        }
        resolve(rate);
      }));
  });

  const getTodayStatis = new Promise((resolve) => {
    getDayStatis(Date.now()).then(data => resolve(data));
  });

  const getTodayRate = new Promise((resolve) => {
    getDayRate(Date.now()).then(data => resolve(data));
  });

  const getMonthStatis = new Promise((resolve) => {
    const intPromises = [];
    for (let i = 0; i < 31; i++) {
      intPromises.push(getDayStatis(Date.now() - (86400000 * i)));
    }
    Promise.all(intPromises).then((data) => {
      resolve(data);
    });
  });

  const getWeekRate = new Promise((resolve) => {
    const intPromises = [];
    for (let i = 0; i < 8; i++) {
      intPromises.push(getDayRate(Date.now() - (86400000 * i)));
    }
    Promise.all(intPromises).then((data) => {
      resolve(data);
    });
  });

  Promise.all([
    getTotalAnsweredSondage,
    getTotalSentSondage,
    getTotalRate,
    getTotalSatis,
    getMonthSentSondage,
    getMonthAnsweredSondage,
    getTodayRate,
    getTodayStatis,
    getMonthStatis,
    getWeekRate,
  ]).then((statisticTab) => {
    const [
      totalAnsweredSondage, 
      totalSentSondage, 
      totalRate,
      totalSatis,
      monthSentSondage, 
      monthAnsweredSondage,
      todayAnsweredSendedRate,
      todayAverageSatisfaction,
      monthAverageSatisfaction,
      weekRate,
    ] = statisticTab;
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
      weekRate: weekRate,
    });
  });
};

User.prototype.findSondage = function (req) {
  return new Promise((resolve) => {
    const { sondage_id, remplissage_id } = req.user;
    const serverResponse = { alreadyAnswered: false };
    Remplissage.findOne({ where: { id: remplissage_id } }).then((remplissage) => {
      Question.findAll({
        include: [{
          model: Thematique,
        }],
        where: { sondage_id: sondage_id }, 
      }).then((questions) => {
        const questionList = [];
        const thematiqueList = new Map();
        questions.forEach((question) => {
          const quest = JSON.parse(JSON.stringify(question));
          delete quest.thematique;
          if (!thematiqueList.get(question.dataValues.thematique.dataValues.id)) {
            thematiqueList.set(
              question.dataValues.thematique.dataValues.id, 
              question.dataValues.thematique.dataValues,
            );
          }
          const newList = thematiqueList.get(question.dataValues.thematique.dataValues.id);
          if (newList.questionList) {
            newList.questionList.push(quest);
          } else {
            newList.questionList = [quest];
          }
          thematiqueList.set(question.dataValues.thematique.dataValues.id, newList); 
        });
        thematiqueList.forEach((elem) => {
          questionList.push(elem);
        });
        serverResponse.thematiqueList = questionList; 

        // Si le sondage a déjà été remplis, on renvois les réponses
        if (remplissage) {
          serverResponse.alreadyAnswered = true;
          Reponse.findAll({ where: { remplissage_id: remplissage_id } }).then((reponses) => {
            Sondage.findOne({ where: { id: sondage_id } }).then((sondage) => {
              Commentaire.findAll({ where: { remplissage_id: remplissage_id } })
                .then((commentaires) => {
                  serverResponse.sondageName = sondage.dataValues.name;
                  const reponseList = [];
                  const commentaireList = [];
                  reponses.forEach((reponse) => {
                    reponseList.push(reponse);
                  });
                  commentaires.forEach((commentaire) => {
                    commentaireList.push(commentaire);
                  }); 
                  serverResponse.reponseList = reponseList;
                  serverResponse.commentaireList = commentaireList;
                  resolve(serverResponse);
                });
            });
          }); 
        } else {
          Sondage.findOne({ where: { id: sondage_id } }).then((sondage) => {
            serverResponse.sondageName = sondage.dataValues.name;
            resolve(serverResponse);
          }); 
        }
      }); 
    });
  });
};
    
// input
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
  const date = simulationDate || Date.now();
  return new Promise((resolve) => {
    const remplissage_id = sondage.remplissage_id;
    const sondage_id = sondage.sondage_id;
    Remplissage.addRemplissage(remplissage_id, sondage_id, this.id, date).then(() => {
      const promises = [];
      sondage.answered_questions.forEach((question_answer) => {
        promises.push(
          Reponse.addReponse(remplissage_id, question_answer.question_id, question_answer.answer),
        );
      });
      sondage.answered_commentaires.forEach((commentaire_answer) => {
        promises.push(
          Commentaire.addCommentaire(
            remplissage_id, commentaire_answer.thematique_id, commentaire_answer.answer,
          ),
        );
      });
      Promise.all(promises).then(() => {
        resolve();
      });
    });
  });
};

User.prototype.updateSondage = function (sondage) {
  return new Promise((resolve) => {
    const remplissage_id = sondage.remplissage_id;
    sondage.answered_questions.forEach((question) => {
      Reponse.findOne({
        where: { 
          remplissage_id: remplissage_id, 
          question_id: question.question_id,
        }, 
      })
        .then((reponse) => {
          Reponse.updateReponse(reponse.dataValues.id, question.answer);
        });
    });
    sondage.answered_commentaires.forEach((commentaire) => {
      Commentaire.findOne({
        where: {
          remplissage_id: remplissage_id, 
          thematique_id: commentaire.thematique_id,
        }, 
      })
        .then((comment) => {
          if (comment) {
            Commentaire.updateCommentaire(comment.dataValues.id, commentaire.answer);
          } else {
            Commentaire.addCommentaire(
              remplissage_id, commentaire.thematique_id, commentaire.answer,
            );
          }
        });
    });
    resolve();
  });
};

const Models = {
  User: User,
  Sondage: Sondage,
  JourSondage: JourSondage,
  Remplissage: Remplissage,
  Question: Question,
  Reponse: Reponse,
  Thematique: Thematique,
  Commentaire: Commentaire,
};

module.exports = Models;