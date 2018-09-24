const Models = require("./index");
const id_generator = require('../custom_module/id_generator');

const { 
  Sondage, Thematique, User, Reponse, Question, Remplissage, Admin, JourSondage, Commentaire,
} = Models;

const startYear = 2018;
const startMonth = 1;
const startDay = 1;
const dayDuration = 30;

const alert = function (message) {
  console.log("");
  console.log("******************************************");
  console.log(` ------------------ ${message} ------------------`);
  console.log("******************************************");
  console.log("");
};

const fakeSurvey = {
  name: 'simulation_survey',
  thematiqueList: [
    {
      name: 'simulation_thematique 1',
      questionList: [
        {
          text: 'th1 question1',
          keyWord: 'q1',
        },
        {
          text: 'th1 question2',
          keyWord: 'q2',
        },
        {
          text: 'th1 question3',
          keyWord: 'q3',
        },
      ],
    },
    {
      name: 'simulation_thematique 2',
      questionList: [
        {
          text: 'th2 question1',
          keyWord: 'q1',
        },
        {
          text: 'th2 question2',
          keyWord: 'q2',
        },
      ],
    },
  ],
};

const simulationDay = new Date(startYear, startMonth, startDay);

// first day, add 1 admin, 10 users and 1 survey
const addFirstAdmin = new Promise(function (resolve) {
  Admin.sync().then(() => {
    Admin.create({
      id: 'admin_simulation_id',
      pseudo: 'admin_simulation_pseudo',
      salt: 'admin_simulation_pseudo',
      hash: 'admin_simulation_pseudo',
      createdAt: simulationDay,
    }).then(() => {
      resolve();
    });
  });
});


const addManyUsers = function (userNumber, resolve) {
  if (userNumber === 0) {
    resolve();
  } else {
    User.sync().then(() => {
      User.create({
        id: id_generator(),
        firstName: "user_simulation_fn",
        lastName: "user_simulation_ln",
        email: "user_simulation_email",
      }).then(() => {
        userNumber -= 1;
        addManyUsers(userNumber, resolve);
      });
    });
  }
};

const addTenUsers = new Promise(function (resolve) {
  addManyUsers(10, resolve);
});

Promise.all([addFirstAdmin, addTenUsers]).then(() => {
  alert("admin et 10 ut");
  
  const firstAdminCreateSurvey = new Promise(function (resolve) {
    Admin.findOne({ pseudo: 'Vince' }).then((admin) => {
      admin.createSondage(fakeSurvey, () => {
        resolve();
      });
    });
  });
});
