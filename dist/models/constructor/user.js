"use strict";

var Sequelize = require('sequelize');

var jwt = require('jsonwebtoken');

var id_generator = require('../../custom_module/id_generator');

var env = require("../../const");

var userConstructor = function userConstructor(sequelize) {
  var User = sequelize.define('user', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    firstName: {
      allowNull: false,
      type: Sequelize.STRING
    },
    lastName: {
      allowNull: false,
      type: Sequelize.STRING
    },
    email: {
      allowNull: false,
      type: Sequelize.STRING
    },
    lastMailDate: {
      type: Sequelize.DATE
    },
    mailIntensity: {
      type: Sequelize.INTEGER
    }
  }, {
    timestamps: false
  }); // Class Methods

  User.addUser = function (firstName, lastName, email) {
    return new Promise(function (resolve) {
      var generatedID = id_generator();
      User.sync().then(function () {
        User.create({
          id: generatedID,
          firstName: firstName,
          lastName: lastName,
          email: email,
          mailIntensity: 1,
          lastMailDate: Date.now()
        }).then(function () {
          resolve();
        });
      });
    });
  }; // Instance methods


  User.prototype.generateJwt = function (sondage_id) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + env.user_token_expiry_time);
    return jwt.sign({
      user_id: this.id,
      sondage_id: sondage_id,
      remplissage_id: id_generator(),
      firstName: this.firstName,
      lastName: this.lastName,
      exp: parseInt(expiry.getTime() / 1000, 10)
    }, env.user_token_secret_key);
  };

  return User;
};

module.exports = userConstructor;
//# sourceMappingURL=user.js.map