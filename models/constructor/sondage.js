const Sequelize = require('sequelize');

const sondageConstructor = function (sequelize) {
  const Sondage = sequelize.define('sondage', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    author: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    date_creation: {
      allowNull: false,
      type: Sequelize.DATEONLY,
    },
    current: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
  });
  Sondage.addSondage = function (id, author, date_creation, name) {
    Sondage.sync().then(() => {
      Sondage.create({
        id: id,
        name: name,
        author: author,
        date_creation: date_creation,
        current: false,
      });
    });
  };
  return Sondage;
};

module.exports = sondageConstructor;
