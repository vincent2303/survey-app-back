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
    createdAt: {
      allowNull: false,
      type: Sequelize.DATEONLY,
    },
  }, {
    timestamps: false,
  });
  Sondage.addSondage = function (id, author, createdAt, name) {
    Sondage.sync().then(() => {
      Sondage.create({
        id: id,
        name: name,
        author: author,
        createdAt: createdAt,
      });
    });
  };
  return Sondage;
};

module.exports = sondageConstructor;
