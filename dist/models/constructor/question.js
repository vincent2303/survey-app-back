"use strict";

var Sequelize = require('sequelize');

var id_generator = require('../../custom_module/id_generator');

var questionConstructor = function questionConstructor(sequelize) {
  var Question = sequelize.define('question', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true
    },
    sondage_id: {
      allowNull: false,
      type: Sequelize.STRING
    },
    thematique_id: {
      allowNull: false,
      type: Sequelize.STRING
    },
    valeur: {
      allowNull: false,
      type: Sequelize.STRING
    }
  });

  Question.addQuestion = function (sondage_id, thematique_id, valeur) {
    Question.sync().then(function () {
      Question.create({
        id: id_generator(),
        thematique_id: thematique_id,
        sondage_id: sondage_id,
        valeur: valeur
      });
    });
  };

  return Question;
};

module.exports = questionConstructor;
//# sourceMappingURL=question.js.map