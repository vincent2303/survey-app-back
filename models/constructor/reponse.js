const Sequelize = require('sequelize');
const id_generator = require('../../custom_module/id_generator');

const reponseConstructor = function (sequelize) {
  const Reponse = sequelize.define('reponse', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    },
    remplissage_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    question_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    valeur: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
  });
  Reponse.addReponse = function (remplissage_id, question_id, valeur) {
    Reponse.sync().then(() => {
      Reponse.create({
        id: id_generator(),
        remplissage_id: remplissage_id,
        question_id: question_id,
        valeur: valeur,
      });
    });
  };
  return Reponse;
};

module.exports = reponseConstructor;