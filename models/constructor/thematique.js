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
  Thematique.addThematique = function (name) {
    Thematique.sync().then(() => {
      Thematique.create({
        id: id_generator(),
        name: name,
      });
    });
  };
  return Thematique;
};

module.exports = thematiqueConstructor;