
const Models = require('../models/index');

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

const dataFetch = {
  getNumberSondages: getNumberSondages,
  getNumberSondagesJour: getNumberSondagesJour,
  getNumberReponses: getNumberReponses,
  getNumberReponsesJour: getNumberReponsesJour,
};

module.exports = dataFetch;