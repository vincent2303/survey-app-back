"use strict";

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

var thematiqueConstructor = require('./constructor/thematique'); // sequelize connection


var sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: 'mysql',
  operatorsAliases: false,
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
var Thematique = thematiqueConstructor(sequelize); // Foreign keys

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
}); // --------  instance method ----------
// structure input:
// let sondage = [
//   {
//     name: "...",
//     questions: [
//       "quelle ... ?",
//       "avez vous ...?",
//       "..."
//     ]
//   }
// ]

Admin.prototype.createSondage = function (sondage) {
  var sondage_id = id_generator();
  Sondage.addSondage(sondage_id, this.pseudo, Date.now());
  sondage.forEach(function (thematique) {
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

      thematique.questions.forEach(function (question) {
        Question.addQuestion(sondage_id, created_or_found_thematique.id, question);
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
//   ],
// };
// uniquement les questions auxquelles l'ut a repondue, pas de question sans reponses


User.prototype.answerSondage = function (sondage) {
  var remplissage_id = sondage.remplissage_id;
  Remplissage.addRemplissage(remplissage_id, sondage.sondage_id, this.id, Date.now());
  sondage.answered_questions.forEach(function (question) {
    Reponse.addReponse(remplissage_id, question.question_id, question.answer);
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
  Thematique: Thematique
}; // exemple d'update
// User.update({firstName:"Jean UPDATED :) "},{where:{id:"7k6ngokwvdpjueo7yv3i"}})
// exemple findById
// User.findById("7k6ngokwvdpjueo7yv3i").then((user)=>{
//     console.log(user)
// })

module.exports = Models;
//# sourceMappingURL=index.js.map