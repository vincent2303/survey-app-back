const Sequelize = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const id_generator = require('../../custom_module/id_generator');
const env = require("../../const");

const adminConstructor = function (sequelize) {
  const Admin = sequelize.define('admin', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    },
    pseudo: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    salt: {
      type: Sequelize.STRING,
    },
    hash: {
      type: Sequelize.STRING,
    },
  });
  Admin.addAdmin = function (pseudo, password, next) {
    const salt = crypto.randomBytes(16).toString('hex');
    Admin.sync().then(() => {
      Admin.create({
        id: id_generator(),
        pseudo,
        salt,
        hash: crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex'),
      });
    });
    next();
  };

  // instance methods
  Admin.prototype.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
  };
  Admin.prototype.generateJwt = function () {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
      id: this.id,
      pseudo: this.pseudo,
      exp: parseInt(expiry.getTime() / 1000, 10),
    }, env.admin_token_secret_key);
  };

  return Admin;
};


module.exports = adminConstructor;
