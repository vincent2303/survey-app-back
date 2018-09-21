"use strict";

var Promise = require("bluebird");

var Models = require('../models/index');

var getNumberRemplissages = function getNumberRemplissages(next) {
  Models.Remplissage.count().then(function (count) {
    next(count);
  });
};

var getNumberRemplissagesJour = function getNumberRemplissagesJour(jour, next) {
  Models.Remplissage.count({
    where: {
      date: jour
    }
  }).then(function (count) {
    next(count);
  });
};

var getCommentairesJour = function getCommentairesJour(jour, next) {
  Models.Commentaire.findAll({
    include: [{
      model: Models.Remplissage,
      where: {
        date: jour
      }
    }, {
      model: Models.Thematique
    }]
  }).then(function (commentaires) {
    var promiseList = [];
    commentaires.forEach(function (commentaire) {
      var promise = new Promise(function (resolve) {
        commentaire.dataValues.user = {
          firstName: "",
          lastName: "",
          email: ""
        };
        Models.User.findOne({
          where: {
            id: commentaire.dataValues.remplissage.dataValues.user_id
          }
        }).then(function (user) {
          console.log(user.dataValues);
          commentaire.dataValues.user.firstName = user.dataValues.firstName;
          commentaire.dataValues.user.lastName = user.dataValues.lastName;
          commentaire.dataValues.user.email = user.dataValues.email;
          resolve();
        });
      });
      promiseList.push(promise);
    });
    Promise.all(promiseList).then(function () {
      console.log("FINISHED!!!!!");
      next(commentaires);
    });
  });
};

var getNumberReponses = function getNumberReponses(next) {
  Models.Reponse.count().then(function (count) {
    next(count);
  });
};

var getNumberReponsesJour = function getNumberReponsesJour(jour, next) {
  Models.Reponse.count({
    include: [{
      model: Models.Remplissage,
      where: {
        date: jour
      }
    }]
  }).then(function (count) {
    next(count);
  });
};

var dataFetch = {
  getNumberRemplissages: getNumberRemplissages,
  getNumberRemplissagesJour: getNumberRemplissagesJour,
  getNumberReponses: getNumberReponses,
  getNumberReponsesJour: getNumberReponsesJour,
  getCommentairesJour: getCommentairesJour
};
module.exports = dataFetch;
//# sourceMappingURL=dataFetch.js.map