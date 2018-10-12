"use strict";

var Sequelize = require('sequelize');

var sondageConstructor = function sondageConstructor(sequelize) {
  var Sondage = sequelize.define('sondage', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING
    },
    author: {
      allowNull: false,
      type: Sequelize.STRING
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATEONLY
    },
    current: {
      allowNull: false,
      type: Sequelize.BOOLEAN
    }
  }, {
    timestamps: false
  });

  Sondage.addSondage = function (id, author, createdAt, name) {
    return new Promise(function (resolve) {
      Sondage.sync().then(function () {
        Sondage.create({
          id: id,
          name: name,
          author: author,
          createdAt: createdAt,
          current: false
        }).then(function () {
          resolve();
        });
      });
    });
  };

  return Sondage;
};

module.exports = sondageConstructor;
//# sourceMappingURL=sondage.js.map