const Sequelize = require('sequelize');
const id_generator = require('../../custom_module/id_generator');

const thematiqueConstructor = function (sequelize) {
  const Thematique = sequelize.define('thematique', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
  }, {
    timestamps: false,
  });
  Thematique.addThematique = function (name) { // id optionnal
    return new Promise(function (resolve) {
      Thematique.sync().then(() => {
        Thematique.findOrCreate({ 
          where: { name: name },
          defaults: { name: name, id: id_generator() },
        }).spread((thematique) => {
          resolve(thematique.dataValues);
        });
      });
    });
  };
  return Thematique;
};

module.exports = thematiqueConstructor;