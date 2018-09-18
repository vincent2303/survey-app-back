"use strict";

var Sequelize = require('sequelize');

var sondageConstructor = function sondageConstructor(sequelize) {
  var Sondage = sequelize.define('sondage', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true
    },
    author: {
      allowNull: false,
      type: Sequelize.STRING
    },
    date_creation: {
      allowNull: false,
      type: Sequelize.STRING
    }
  });

  Sondage.addSondage = function (id, author, date_creation) {
    Sondage.sync().then(function () {
      Sondage.create({
        id: id,
        author: author,
        date_creation: date_creation
      });
    });
  };

  return Sondage;
};

module.exports = sondageConstructor;
//# sourceMappingURL=sondage.js.map