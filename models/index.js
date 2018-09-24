const Sequelize = require('sequelize');
const env = require('../const');
const id_generator = require('../custom_module/id_generator');

// models constructors
const userConstructor = require('./constructor/user');
const adminConstructor = require('./constructor/admin');
const jourSondageConstructor = require('./constructor/jourSondage');
const questionConstructor = require('./constructor/question');
const remplissageConstructor = require('./constructor/remplissage');
const reponseConstructor = require('./constructor/reponse');
const sondageConstructor = require('./constructor/sondage');
const thematiqueConstructor = require('./constructor/thematique');
const commentaireConstructor = require('./constructor/commentaire');

const Op = Sequelize.Op;
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
const Admin = adminConstructor(sequelize);
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
Admin.prototype.getSondage = function () {
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

Admin.prototype.createSondage = function (sondage) {
  return new Promise((resolve) => {
    const sondage_id = id_generator();
    const promises = [];
    promises.push(Sondage.addSondage(sondage_id, this.pseudo, Date.now(), sondage.name));
    sondage.thematiqueList.forEach((thematique) => {
      Thematique.findOrCreate(
        { 
          where: { name: thematique.name },
          defaults: { name: thematique.name, id: id_generator() },
        },
      ).spread(
        (created_or_found_thematique, created_value) => {
          if (created_value) {
            console.log("nouvelle thematique");
          }
          thematique.questionList.forEach((question) => {
            promises.push(Question.addQuestion(
              sondage_id, created_or_found_thematique.id,
              question.text,
              question.keyWord,
            ));
          });
        },
      );
    });
    Promise.all(promises).then(resolve);
  });
};

Admin.prototype.getStatistics = function (next) {
  const statistics = {
    monthSentSondage: [], // fait
    monthAnsweredSondage: [], // fait
    totalSentSondage: 0, // fait
    totalAnsweredSondage: 0, // fait
    todayAnsweredSendedRate: 0, // fait
    todayAverageSatisfaction: 0, // fait
    weekAverageSatisfaction: [], // fait
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

  const getTodayRate = new Promise((resolve) => {
    Promise.all([getJourAnsweredSondage(Date.now()), getJourSentSondage(Date.now())])
      .then(((data) => {
        console.log(data);
        const rate = data[0] / data[1];
        resolve(rate);
      }));
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
        resolve(satisfaction / reps.length);
      } else {
        resolve(0);
      }
    });
  });

  const getTodayStatis = new Promise((resolve) => {
    getDayStatis(Date.now()).then(data => resolve(data));
  });

  const getWeekStatis = new Promise((resolve) => {
    const intPromises = [];
    for (let i = 0; i < 8; i++) {
      intPromises.push(getDayStatis(Date.now() - (86400000 * i)));
    }
    Promise.all(intPromises).then((data) => {
      resolve(data);
    });
  });

  Promise.all([
    getTotalAnsweredSondage,
    getTotalSentSondage,
    getMonthSentSondage,
    getMonthAnsweredSondage,
    getTodayRate,
    getTodayStatis,
    getWeekStatis,
  ]).then((statisticTab) => {
    const [
      totalAnsweredSondage, 
      totalSentSondage, 
      monthSentSondage, 
      monthAnsweredSondage,
      todayAnsweredSendedRate,
      todayAverageSatisfaction,
      weekAverageSatisfaction] = statisticTab;
    next({
      totalSentSondage: totalSentSondage,
      totalAnsweredSondage: totalAnsweredSondage,
      monthSentSondage: monthSentSondage,
      monthAnsweredSondage: monthAnsweredSondage,
      todayAnsweredSendedRate: todayAnsweredSendedRate,
      todayAverageSatisfaction: todayAverageSatisfaction,
      weekAverageSatisfaction: weekAverageSatisfaction,
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
User.prototype.answerSondage = function (sondage) {
  return new Promise((resolve) => {
    const remplissage_id = sondage.remplissage_id;
    const Promises = [];
    Promises.push(
      Remplissage.addRemplissage(remplissage_id, sondage.sondage_id, this.id, Date.now()),
    );
    sondage.answered_questions.forEach((question) => {
      Promises.push(Reponse.addReponse(remplissage_id, question.question_id, question.answer));
    });
    sondage.answered_commentaires.forEach((commentaire) => {
      Promises.push(
        Commentaire.addCommentaire(remplissage_id, commentaire.thematique_id, commentaire.answer),
      );
    });
    Promise.all(Promises).then(resolve);
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
          Commentaire.updateCommentaire(comment.dataValues.id, commentaire.answer);
        });
    });
    resolve();
  });
};

const Models = {
  User: User,
  Admin: Admin,
  Sondage: Sondage,
  JourSondage: JourSondage,
  Remplissage: Remplissage,
  Question: Question,
  Reponse: Reponse,
  Thematique: Thematique,
  Commentaire: Commentaire,
};

module.exports = Models;