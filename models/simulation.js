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
const promiseArray = [];

promiseArray.push(Admin.addAdmin('Vince', 'Vince'));
for (let i = 0; i < 10; i++) {
  promiseArray.push(User.addUser('simulation_user', 'simulation_user', 'simulation_user'));
}

Promise.all(promiseArray).then(() => {
  console.log('1 Admin et 10 utilisateurs ajouté');
  Admin.find({ where: { pseudo: 'Vince' } }).then((admin) => {
    
  });
});
