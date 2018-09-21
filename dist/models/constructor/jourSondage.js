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
  });

  JourSondage.addJourSondage = function (sondage_id, date_emmission, nombre_emission) {
    JourSondage.sync().then(function () {
      JourSondage.create({
        id: id_generator(),
        sondage_id: sondage_id,
        date_emmission: date_emmission,
        nombre_emission: nombre_emission
      });
    });
  };

  return JourSondage;
};

module.exports = jourSondageConstructor;
//# sourceMappingURL=jourSondage.js.map