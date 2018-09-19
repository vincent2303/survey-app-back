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
    date_creation: {
      allowNull: false,
      type: Sequelize.DATEONLY
    }
  });

  Sondage.addSondage = function (id, author, date_creation, name) {
    Sondage.sync().then(function () {
      Sondage.create({
        id: id,
        name: name,
        author: author,
        date_creation: date_creation
      });
    });
  };

  return Sondage;
};

module.exports = sondageConstructor;
//# sourceMappingURL=sondage.js.map