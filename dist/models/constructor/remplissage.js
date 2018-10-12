"use strict";

var Sequelize = require('sequelize');

var remplissageConstructor = function remplissageConstructor(sequelize) {
  var Remplissage = sequelize.define('remplissage', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true
    },
    sondage_id: {
      allowNull: false,
      type: Sequelize.STRING
    },
    user_id: {
      allowNull: false,
      type: Sequelize.STRING
    },
    date: {
      allowNull: false,
      type: Sequelize.DATEONLY
    }
  }, {
    timestamps: false
  });

  Remplissage.addRemplissage = function (id, sondage_id, user_id, date) {
    return new Promise(function (resolve) {
      Remplissage.sync().then(function () {
        Remplissage.create({
          id: id,
          user_id: user_id,
          sondage_id: sondage_id,
          date: date
        }).then(function () {
          resolve();
        });
      });
    });
  };

  return Remplissage;
};

module.exports = remplissageConstructor;
//# sourceMappingURL=remplissage.js.map