const Sequelize = require('sequelize');

const remplissageConstructor = function (sequelize) {
  const Remplissage = sequelize.define('remplissage', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    },
    sondage_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    user_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    date: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
  Remplissage.addRemplissage = function (id, sondage_id, user_id, date) {
    Remplissage.sync().then(() => {
      Remplissage.create({
        id: id,
        user_id: user_id,
        sondage_id: sondage_id,
        date: date,
      });
    });
  };
  return Remplissage;
};

module.exports = remplissageConstructor;