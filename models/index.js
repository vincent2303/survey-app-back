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

// sequelize connection
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: 'mysql',
  operatorsAliases: false,
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

// Foreign keys
Question.belongsTo(Sondage, { foreignKey: 'sondage_id', targetKey: 'id' });
JourSondage.belongsTo(Sondage, { foreignKey: 'sondage_id', targetKey: 'id' });
Reponse.belongsTo(Question, { foreignKey: 'question_id', targetKey: 'id' });
Reponse.belongsTo(Remplissage, { foreignKey: 'remplissage_id', targetKey: 'id' });
Remplissage.belongsTo(Sondage, { foreignKey: 'sondage_id', targetKey: 'id' });
Remplissage.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
Question.belongsTo(Thematique, { foreignKey: 'thematique_id', targetKey: 'id' });
Commentaire.belongsTo(Thematique, { foreignKey: 'thematique_id', targetKey: 'id' });
Commentaire.belongsTo(Remplissage, { foreignKey: 'remplissage_id', targetKey: 'id' });

Admin.prototype.getSondage = function (next) {
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
        });
      });
      next(sondageList);
    });
  });
};

Admin.prototype.createSondage = function (sondage, next) {
  console.log(sondage);
  const sondage_id = id_generator();
  Sondage.addSondage(sondage_id, this.pseudo, Date.now(), sondage.name);
  sondage.thematiqueList.forEach((thematique) => {
    Thematique.findOrCreate(
      { where: { name: thematique.name }, defaults: { name: thematique.name, id: id_generator() } },
    ).spread(
      (created_or_found_thematique, created_value) => {
        if (created_value) {
          console.log("nouvelle thematique");
        }
        thematique.questionList.forEach((question) => {
          Question.addQuestion(
            sondage_id, created_or_found_thematique.id,
            question.text,
            question.keyWord,
          );
        });
      },
    );
  });
  next();
};

Admin.prototype.getStatistics = function (next) {
  const statistics = {
    monthSendedSondage: [],
    monthAnsweredSondage: [],
    totalSendedSondage: 0, // fait
    totalAnsweredSondage: 0, // fait
    todayAnsweredSendedRate: 0, // answer/send
    todayAverageSatisfaction: 0,
    weekAverageSatisfaction: [],
  };
  
  const getTotalAnsweredSondage = new Promise(function (resolve) {
    Remplissage.count().then((total) => {
      resolve(total);
    });
  });

  const getTotalSendedSondage = new Promise(function (resolve) {
    JourSondage.sum('nombre_emission').then((total) => {
      resolve(total);
    });
  });

  Promise.all([
    getTotalAnsweredSondage,
    getTotalSendedSondage,
  ]).then((statisticTab) => {
    const [totalSendedSondage, totalAnsweredSondage] = statisticTab;
    next({
      totalSendedSondage: totalSendedSondage,
      totalAnsweredSondage: totalAnsweredSondage,
    });
  });
};

User.prototype.answerSondage = function (sondage) {
  const remplissage_id = sondage.remplissage_id;
  Remplissage.addRemplissage(remplissage_id, sondage.sondage_id, this.id, Date.now());
  sondage.answered_questions.forEach((question) => {
    Reponse.addReponse(remplissage_id, question.question_id, question.answer);
  });
  sondage.answered_commentaires.forEach((commentaire) => {
    Commentaire.addCommentaire(remplissage_id, commentaire.thematique_id, commentaire.answer);
  });
};

User.prototype.updateSondage = function (sondage) {
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