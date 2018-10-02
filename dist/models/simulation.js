"use strict";

var Models = require("./index");

var randInt = require('../custom_module/randInt');

var id_generator = require('../custom_module/id_generator');

var clearTables = require('./setup');

var Sondage = Models.Sondage,
    User = Models.User,
    Reponse = Models.Reponse,
    Question = Models.Question,
    Remplissage = Models.Remplissage,
    Admin = Models.Admin,
    JourSondage = Models.JourSondage;
var simulationTime = 35;
var simulationDay = new Date();
simulationDay.setDate(simulationDay.getDate() - simulationTime);

var rand = function rand(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

var randRep = function randRep(date) {
  var diff = simulationTime - Math.round((Date.now() - date) / (1000 * 60 * 60 * 24));
  var i = rand(44) + rand(diff);

  if (i >= 0 && i <= 14) {
    return -1;
  }

  if (i >= 15 && i <= 29) {
    return 0;
  }

  if (i >= 29) {
    return 1;
  }
};

var fakeSurvey = {
  name: 'Condition de travail',
  thematiqueList: [{
    name: 'Cafétaria',
    questionList: [{
      text: 'Le repas était-il convenable?',
      keyWord: 'Qualité'
    }, {
      text: "Comment était l'attente?",
      keyWord: 'Attente'
    }, {
      text: 'Etait-ce trop bryuant?',
      keyWord: 'Bruit'
    }, {
      text: 'th1 question4',
      keyWord: 'q4'
    }, {
      text: 'th1 question5',
      keyWord: 'q5'
    }]
  }, {
    name: 'Bureau',
    questionList: [{
      text: "Avez vous été productif aujourd'hui?",
      keyWord: 'Productivité'
    }, {
      text: 'Comment était la température?',
      keyWord: 'Température'
    }, {
      text: 'Etait-ce trop bryuant?',
      keyWord: 'Bruit'
    }, {
      text: 'Votre bureau était il sale?',
      keyWord: 'Propreté'
    }, {
      text: 'th2 question3',
      keyWord: 'q3'
    }, {
      text: 'th2 question4',
      keyWord: 'q4'
    }]
  }, {
    name: 'thematique 3',
    questionList: [{
      text: 'th3 question1',
      keyWord: 'q1'
    }, {
      text: 'th3 question2',
      keyWord: 'q2'
    }, {
      text: 'th3 question3',
      keyWord: 'q3'
    }]
  }]
};

var incrementDay = function incrementDay() {
  simulationDay.setDate(simulationDay.getDate() + 1);
};

var addManyUsers = function addManyUsers(userNumber) {
  return new Promise(function (resolve) {
    if (userNumber > 0) {
      var promiseArray = [];

      for (var i = 0; i < userNumber; i++) {
        promiseArray.push(User.addUser('Goulven suce des gros chibre', ' et il a une patite bite', 'goulven.molaret@supekec.fr'));
      }

      Promise.all(promiseArray).then(resolve);
    } else {
      resolve();
    }
  });
};

var fakeSurvey_id = null;
var questionIdList = [];

var getQuestionIdList = function getQuestionIdList(fakeSurveyId) {
  fakeSurvey_id = fakeSurveyId;
  return new Promise(function (resolve) {
    Question.findAll({
      where: {
        sondage_id: fakeSurveyId
      }
    }).then(function (questions) {
      questions.forEach(function (question) {
        questionIdList.push(question.id);
      });
      console.log("nombre de question dans la base de donnée:", questionIdList.length, "  ", questions.length);
      resolve();
    });
  });
};

var answerSondage_simulation = function answerSondage_simulation(user, date) {
  return new Promise(function (resolve) {
    var fake_answer = {
      remplissage_id: id_generator(),
      sondage_id: fakeSurvey_id,
      answered_questions: [],
      answered_commentaires: []
    };
    questionIdList.forEach(function (question_id) {
      fake_answer.answered_questions.push({
        question_id: question_id,
        answer: randRep(date)
      });
    });
    user.answerSondage(fake_answer, date).then(function () {
      resolve();
    });
  });
};

var answerUserListSondage_simulation = function answerUserListSondage_simulation(users, date) {
  return new Promise(function (resolve) {
    var promiseArray = [];
    JourSondage.addJourSondage(fakeSurvey_id, simulationDay, users.length);
    users.forEach(function (user) {
      if (rand(3) !== 0) {
        promiseArray.push(answerSondage_simulation(user, date));
      }
    });
    Promise.all(promiseArray).then(function () {
      resolve();
    });
  });
};

var answerAll = function answerAll() {
  return new Promise(function (resolve) {
    Sondage.findOne({
      where: {
        name: fakeSurvey.name
      }
    }).then(function () {
      User.findAll().then(function (users) {
        answerUserListSondage_simulation(users, simulationDay).then(function () {
          resolve();
        });
      });
    });
  });
};

var firstDay = function firstDay() {
  return new Promise(function (resolve) {
    Admin.addAdmin('Vince', 'Vince').then(function () {
      addManyUsers(10).then(function () {
        Admin.findOne({
          where: {
            pseudo: 'Vince'
          }
        }).then(function (admin) {
          admin.createSondage(fakeSurvey).then(function (sondage_id) {
            Sondage.update({
              current: true
            }, {
              where: {
                id: sondage_id
              }
            });
            getQuestionIdList(sondage_id).then(function () {
              answerAll().then(function () {
                incrementDay();
                resolve();
              });
            });
          });
        });
      });
    });
  });
};

var day = function day(numberAddeduser) {
  return new Promise(function (resolve) {
    addManyUsers(numberAddeduser).then(function () {
      answerAll().then(function () {
        incrementDay();
        resolve();
      });
    });
  });
};

var Alldays = function Alldays(compteur) {
  if (compteur === 0) {
    console.log(' -- fin --');
    User.count().then(function (sum) {
      console.log("user :", sum);
    });
    Remplissage.count().then(function (sum) {
      console.log("remplissage :", sum);
    });
    Reponse.count().then(function (sum) {
      console.log("reponses :", sum);
    });
  } else {
    compteur--;
    console.log(compteur);

    if (compteur <= 15) {
      day(rand(2)).then(function () {
        Alldays(compteur);
      });
    } else {
      day(rand(5)).then(function () {
        Alldays(compteur);
      });
    }
  }
};

clearTables().then(function () {
  console.log("");
  console.log("------------------------------------------");
  console.log("");
  firstDay().then(function () {
    Alldays(simulationTime);
  });
});
//# sourceMappingURL=simulation.js.map