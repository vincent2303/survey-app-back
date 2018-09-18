const Sequelize = require('sequelize');

const sondageConstructor = function (sequelize) {
  const Sondage = sequelize.define('sondage', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    },
    author: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    date_creation: {
      allowNull: false,
      type: Sequelize.DATEONLY,
    },
  });
  Sondage.addSondage = function (id, author, date_creation) {
    Sondage.sync().then(() => {
      Sondage.create({
        id: id,
        author: author,
        date_creation: date_creation,
      });
    });
  };
  return Sondage;
};

module.exports = sondageConstructor;
