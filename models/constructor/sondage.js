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
<<<<<<< HEAD
  }, {
    timestamps: false,
=======
    current: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
>>>>>>> refs/remotes/origin/dev
  });
  Sondage.addSondage = function (id, author, createdAt, name) {
    Sondage.sync().then(() => {
      Sondage.create({
        id: id,
        name: name,
        author: author,
<<<<<<< HEAD
        createdAt: createdAt,
=======
        date_creation: date_creation,
        current: false,
>>>>>>> refs/remotes/origin/dev
      });
    });
  };
  return Sondage;
};

module.exports = sondageConstructor;
