"use strict";

var Sequelize = require('sequelize');

var crypto = require('crypto');

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
    salt: {
      type: Sequelize.STRING
    },
    hash: {
      type: Sequelize.STRING
    },
    photo: {
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

  User.addUser = function (firstName, lastName, email, password) {
    var photo = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : './public/user/photo/default.jpg';
    return new Promise(function (resolve) {
      var generatedID = id_generator();
      var salt = crypto.randomBytes(16).toString('hex');
      User.sync().then(function () {
        User.create({
          id: generatedID,
          firstName: firstName,
          lastName: lastName,
          email: email,
          salt: salt,
          hash: crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex'),
          photo: photo,
          mailIntensity: 1,
          lastMailDate: Date.now() - 86400000
        }).then(function () {
          resolve();
        });
      });
    });
  }; // Instance methods


  User.prototype.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
  };

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