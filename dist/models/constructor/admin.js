"use strict";

var Sequelize = require('sequelize');

var crypto = require('crypto');

var jwt = require('jsonwebtoken');

var id_generator = require('../../custom_module/id_generator');

var env = require("../../const");

var adminConstructor = function adminConstructor(sequelize) {
  var Admin = sequelize.define('admin', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true
    },
    pseudo: {
      allowNull: false,
      type: Sequelize.STRING
    },
    salt: {
      type: Sequelize.STRING
    },
    hash: {
      type: Sequelize.STRING
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  }, {
    timestamps: false
  });

  Admin.addAdmin = function (pseudo, password, date) {
    var createdAt = date || Date.now();
    return new Promise(function (resolve) {
      var salt = crypto.randomBytes(16).toString('hex');
      Admin.sync().then(function () {
        Admin.create({
          id: id_generator(),
          pseudo: pseudo,
          salt: salt,
          hash: crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex'),
          createdAt: createdAt
        }).then(function () {
          console.log("Ajout Admin $$$");
          resolve();
        });
      });
    });
  }; // instance methods


  Admin.prototype.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
  };

  Admin.prototype.generateJwt = function () {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
      id: this.id,
      pseudo: this.pseudo,
      exp: parseInt(expiry.getTime() / 1000, 10)
    }, env.admin_token_secret_key);
  };

  return Admin;
};

module.exports = adminConstructor;
//# sourceMappingURL=admin.js.map