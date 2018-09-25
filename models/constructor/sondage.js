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
    current: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
  }, {
    timestamps: false,
  });

  Sondage.addSondage = function (id, author, createdAt, name) {
    return new Promise(function (resolve) {
      Sondage.sync().then(() => {
        Sondage.create({
          id: id,
          name: name,
          author: author,
          createdAt: createdAt,
          current: false,
        }).then(() => {
          resolve();
        });
      });
    });
  };
  return Sondage;
};

module.exports = sondageConstructor;
