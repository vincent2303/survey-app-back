
const Models = require('../models/index');

/* const getNumberSondages = new Promise(function (resolve) {
  resolve(Models.Remplissage.count().then(count => count));
}); */

const getNumberSondages = function (next) {
  Models.Remplissage.count().then((count) => { 
    next(count); 
  });
};

const getNumberSondagesJour = function (jour, next) {
  Models.Remplissage.count({ where: { date: jour } }).then((count) => { 
    next(count); 
  });
};

const dataFetch = {
  getNumberSondages: getNumberSondages,
  getNumberSondagesJour: getNumberSondagesJour,
};

module.exports = dataFetch;