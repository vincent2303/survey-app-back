const Sequelize = require('sequelize');
const id_generator = require('../../custom_module/id_generator');

const jourSondageConstructor = function (sequelize) {
  const JourSondage = sequelize.define('jourSondage', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    },
    sondage_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    date_emmission: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
  JourSondage.addJourSondage = function (sondage_id, date_emmission) {
    JourSondage.sync().then(() => {
      JourSondage.create({
        id: id_generator(),
        sondage_id: sondage_id,
        date_emmission: date_emmission,
      });
    });
  };
  return JourSondage;
};

module.exports = jourSondageConstructor;