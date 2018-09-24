const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const id_generator = require('../../custom_module/id_generator');
const env = require("../../const");

const userConstructor = function (sequelize) {
  const User = sequelize.define('user', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    firstName: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    lastName: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    email: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    lastMailDate: {
      type: Sequelize.DATE,
    },
    mailIntensity: {
      type: Sequelize.INTEGER,
    },
  }, {
    timestamps: false,
  });

  // Class Methods
  User.addUser = function (firstName, lastName, email) {
    return new Promise(function (resolve) {
      const generatedID = id_generator();
      User.sync().then(() => {
        User.create({
          id: generatedID,
          firstName,
          lastName,
          email,
          mailIntensity: 1,
          lastMailDate: Date.now(),
        }).then(() => {
          resolve();
        });
      });
    });
  };

  // Instance methods
  User.prototype.generateJwt = function (sondage_id) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + env.user_token_expiry_time);
    return jwt.sign({
      user_id: this.id,
      sondage_id: sondage_id,
      remplissage_id: id_generator(),
      firstName: this.firstName,
      lastName: this.lastName,
      exp: parseInt(expiry.getTime() / 1000, 10),
    }, env.user_token_secret_key);
  };
  return User;
};

module.exports = userConstructor;
