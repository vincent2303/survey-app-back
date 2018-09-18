"use strict";

var Models = require('../models/index');
/* const getNumberSondages = new Promise(function (resolve) {
  resolve(Models.Remplissage.count().then(count => count));
}); */


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

var dataFetch = {
  getNumberSondages: getNumberSondages,
  getNumberSondagesJour: getNumberSondagesJour
};
module.exports = dataFetch;
//# sourceMappingURL=dataFetch.js.map