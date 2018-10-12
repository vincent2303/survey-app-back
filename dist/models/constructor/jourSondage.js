"use strict";

var Sequelize = require('sequelize');

var id_generator = require('../../custom_module/id_generator');

var jourSondageConstructor = function jourSondageConstructor(sequelize) {
  var JourSondage = sequelize.define('jourSondage', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true
    },
    sondage_id: {
      allowNull: false,
      type: Sequelize.STRING
    },
    date_emmission: {
      allowNull: false,
      type: Sequelize.DATEONLY
    },
    nombre_emission: {
      allowNull: false,
      type: Sequelize.INTEGER
    }
  }, {
    timestamps: false
  });

  JourSondage.addJourSondage = function (sondage_id, date_emmission, nombre_emission) {
    return new Promise(function (resolve) {
      JourSondage.sync().then(function () {
        JourSondage.create({
          id: id_generator(),
          sondage_id: sondage_id,
          date_emmission: date_emmission,
          nombre_emission: nombre_emission
        }).then(function () {
          resolve();
        });
      });
    });
  };

  return JourSondage;
};

module.exports = jourSondageConstructor;
//# sourceMappingURL=jourSondage.js.map