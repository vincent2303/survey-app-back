"use strict";

var Models = require('../models/index');

var getNumberSondages = function getNumberSondages(next) {
  Models.Remplissage.count().then(function (count) {
    next(count);
  });
};

var getNumberSondagesJour = function getNumberSondagesJour(jour, next) {
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
  getNumberSondages: getNumberSondages,
  getNumberSondagesJour: getNumberSondagesJour,
  getNumberReponses: getNumberReponses,
  getNumberReponsesJour: getNumberReponsesJour
};
module.exports = dataFetch;
//# sourceMappingURL=dataFetch.js.map