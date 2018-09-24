"use strict";

var Models = require("./index");

var id_generator = require('../custom_module/id_generator');

var Sondage = Models.Sondage,
    Thematique = Models.Thematique,
    User = Models.User,
    Reponse = Models.Reponse,
    Question = Models.Question,
    Remplissage = Models.Remplissage,
    Admin = Models.Admin,
    JourSondage = Models.JourSondage,
    Commentaire = Models.Commentaire;
var startYear = 2018;
var startMonth = 1;
var startDay = 1;
var dayDuration = 30;

var alert = function alert(message) {
  console.log("");
  console.log("******************************************");
  console.log(" ------------------ ".concat(message, " ------------------"));
  console.log("******************************************");
  console.log("");
};

var fakeSurvey = {
  name: 'simulation_survey',
  thematiqueList: [{
    name: 'simulation_thematique 1',
    questionList: [{
      text: 'th1 question1',
      keyWord: 'q1'
    }, {
      text: 'th1 question2',
      keyWord: 'q2'
    }, {
      text: 'th1 question3',
      keyWord: 'q3'
    }]
  }, {
    name: 'simulation_thematique 2',
    questionList: [{
      text: 'th2 question1',
      keyWord: 'q1'
    }, {
      text: 'th2 question2',
      keyWord: 'q2'
    }]
  }]
};
var simulationDay = new Date(startYear, startMonth, startDay); // first day, add 1 admin, 10 users and 1 survey

var addFirstAdmin = new Promise(function (resolve) {
  Admin.sync().then(function () {
    Admin.create({
      id: 'admin_simulation_id',
      pseudo: 'admin_simulation_pseudo',
      salt: 'admin_simulation_pseudo',
      hash: 'admin_simulation_pseudo',
      createdAt: simulationDay
    }).then(function () {
      resolve();
    });
  });
});

var addManyUsers = function addManyUsers(userNumber, resolve) {
  if (userNumber === 0) {
    resolve();
  } else {
    User.sync().then(function () {
      User.create({
        id: id_generator(),
        firstName: "user_simulation_fn",
        lastName: "user_simulation_ln",
        email: "user_simulation_email"
      }).then(function () {
        userNumber -= 1;
        addManyUsers(userNumber, resolve);
      });
    });
  }
};

var addTenUsers = new Promise(function (resolve) {
  addManyUsers(10, resolve);
});
Promise.all([addFirstAdmin, addTenUsers]).then(function () {
  alert("admin et 10 ut");
  var firstAdminCreateSurvey = new Promise(function (resolve) {
    Admin.findOne({
      pseudo: 'Vince'
    }).then(function (admin) {
      admin.createSondage(fakeSurvey, function () {
        resolve();
      });
    });
  });
});
//# sourceMappingURL=simulation.js.map