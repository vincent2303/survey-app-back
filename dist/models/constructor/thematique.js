"use strict";

var Sequelize = require('sequelize');

var id_generator = require('../../custom_module/id_generator');

var thematiqueConstructor = function thematiqueConstructor(sequelize) {
  var Thematique = sequelize.define('thematique', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING
    }
  });

  Thematique.addThematique = function (name) {
    Thematique.sync().then(function () {
      Thematique.create({
        id: id_generator(),
        name: name
      });
    });
  };

  return Thematique;
};

module.exports = thematiqueConstructor;
//# sourceMappingURL=thematique.js.map