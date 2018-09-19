"use strict";

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
  getNumberReponsesJour: getNumberReponsesJour
};
module.exports = dataFetch;
//# sourceMappingURL=dataFetch.js.map