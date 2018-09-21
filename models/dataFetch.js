const Promise = require("bluebird");

const Models = require('../models/index');

const getNumberRemplissages = function (next) {
  Models.Remplissage.count().then((count) => { 
    next(count); 
  });
};

const getNumberRemplissagesJour = function (jour, next) {
  Models.Remplissage.count({ where: { date: jour } }).then((count) => { 
    next(count); 
  });
};

const getCommentairesJour = function (jour, next) {
  Models.Commentaire.findAll({
    include: [{
      model: Models.Remplissage,
      where: { date: jour },
    },
    {
      model: Models.Thematique,
    },
    ],
  }).then((commentaires) => {
    const promiseList = [];
    commentaires.forEach((commentaire) => {
      const promise = new Promise((resolve) => {
        commentaire.dataValues.user = {
          firstName: "",
          lastName: "",
          email: "",
        };
        Models.User.findOne({ where: { id: commentaire.dataValues.remplissage.dataValues.user_id } })
          .then((user) => {
            commentaire.dataValues.user.firstName = user.dataValues.firstName;
            commentaire.dataValues.user.lastName = user.dataValues.lastName;
            commentaire.dataValues.user.email = user.dataValues.email;
            resolve();
          });
      });
      promiseList.push(promise);
    });
    Promise.all(promiseList).then(() => {
      console.log("FINISHED!!!!!");
      next(commentaires);
    });
  });
};

const getNumberReponses = function (next) {
  Models.Reponse.count().then((count) => { 
    next(count); 
  });
};

const getNumberReponsesJour = function (jour, next) {
  Models.Reponse.count({ 
    include: [{
      model: Models.Remplissage,
      where: { date: jour },
    }],
  }).then((count) => { 
    next(count); 
  });
};

const getAllStatistics = function () {
  
};

const dataFetch = {
  getNumberRemplissages: getNumberRemplissages,
  getNumberRemplissagesJour: getNumberRemplissagesJour,
  getNumberReponses: getNumberReponses,
  getNumberReponsesJour: getNumberReponsesJour,
  getCommentairesJour: getCommentairesJour,
};

module.exports = dataFetch;