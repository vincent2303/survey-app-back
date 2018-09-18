"use strict";

var Sequelize = require('sequelize');

var id_generator = require('../../custom_module/id_generator');

var reponseConstructor = function reponseConstructor(sequelize) {
  var Reponse = sequelize.define('reponse', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true
    },
    remplissage_id: {
      allowNull: false,
      type: Sequelize.STRING
    },
    question_id: {
      allowNull: false,
      type: Sequelize.STRING
    },
    valeur: {
      allowNull: false,
      type: Sequelize.STRING
    }
  });

  Reponse.addReponse = function (remplissage_id, question_id, valeur) {
    Reponse.sync().then(function () {
      Reponse.create({
        id: id_generator(),
        remplissage_id: remplissage_id,
        question_id: question_id,
        valeur: valeur
      });
    });
  };

  return Reponse;
};

module.exports = reponseConstructor;
//# sourceMappingURL=reponse.js.map