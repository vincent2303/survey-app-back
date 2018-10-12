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
  }, {
    timestamps: false
  });

  Thematique.addThematique = function (name) {
    // id optionnal
    return new Promise(function (resolve) {
      Thematique.sync().then(function () {
        Thematique.findOrCreate({
          where: {
            name: name
          },
          defaults: {
            name: name,
            id: id_generator()
          }
        }).spread(function (thematique) {
          resolve(thematique.dataValues);
        });
      });
    });
  };

  return Thematique;
};

module.exports = thematiqueConstructor;
//# sourceMappingURL=thematique.js.map