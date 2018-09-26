const Models = require("./index");
const randInt = require('../custom_module/randInt');
const id_generator = require('../custom_module/id_generator');
const clearTables = require('./setup');

const { 
  Sondage, User, Reponse, Question, Remplissage, Admin, JourSondage,
} = Models;

const simulationTime = 35;
const simulationDay = new Date();
simulationDay.setDate(simulationDay.getDate() - simulationTime);

const rand = function (max) {
  return Math.floor(Math.random() * Math.floor(max));
};

const randRep = function (date) {
  const diff = simulationTime - Math.round((Date.now() - date) / (1000 * 60 * 60 * 24));
  const i = rand(44) + rand(diff);
  if (i >= 0 && i <= 14) {
    return (-1);
  } if (i >= 15 && i <= 29) {
    return (0);
  } if (i >= 29) {
    return (1);
  } 
};

const fakeSurvey = {
  name: 'Condition de travail',
  thematiqueList: [
    {
      name: 'Cafétaria',
      questionList: [
        {
          text: 'Le repas était-il convenable?',
          keyWord: 'Qualité',
        },
        {
          text: "Comment était l'attente?",
          keyWord: 'Attente',
        },
        {
          text: 'Etait-ce trop bryuant?',
          keyWord: 'Bruit',
        },
        {
          text: 'th1 question3',
          keyWord: 'q4',
        },
        {
          text: 'th1 question3',
          keyWord: 'q5',
        },
      ],
    },
    {
      name: 'Bureau',
      questionList: [
        {
          text: "Avez vous été productif aujourd'hui?",
          keyWord: 'Productivité',
        },
        {
          text: 'Comment était la température?',
          keyWord: 'Température',
        },
        {
          text: 'Etait-ce trop bryuant?',
          keyWord: 'Bruit',
        },
        {
          text: 'Votre bureau était il sale?',
          keyWord: 'Propreté',
        },
      ],
    },
  ],
};

const incrementDay = function () {
  simulationDay.setDate(simulationDay.getDate() + 1);
};

const addManyUsers = function (userNumber) {
  return new Promise(function (resolve) {
    if (userNumber > 0) {
      const promiseArray = [];
      for (let i = 0; i < userNumber; i++) {
        promiseArray.push(User.addUser('Goulven suce des gros chibre', ' et il a une patite bite', 'goulven.molaret@supekec.fr'));
      }
      Promise.all(promiseArray).then(resolve);
    } else {
      resolve();
    }
  });
};

let fakeSurvey_id = null;
const questionIdList = [];

const getQuestionIdList = function (fakeSurveyId) {
  fakeSurvey_id = fakeSurveyId;
  return new Promise(function (resolve) {
    Question.findAll({ where: { sondage_id: fakeSurveyId } }).then((questions) => {
      questions.forEach((question) => {
        questionIdList.push(question.id);
      });
      console.log("nombre de question dans la base de donnée:", questionIdList.length, "  ", questions.length);
      resolve();
    });
  });
};

const answerSondage_simulation = function (user, date) {
  return new Promise(function (resolve) {
    const fake_answer = {
      remplissage_id: id_generator(),
      sondage_id: fakeSurvey_id,
      answered_questions: [],
      answered_commentaires: [],
    };
    questionIdList.forEach((question_id) => {
      fake_answer.answered_questions.push({
        question_id: question_id,
        answer: randRep(date),
      });
    });
    user.answerSondage(fake_answer, date).then(() => {
      resolve();
    });
  });
};

const answerUserListSondage_simulation = function (users, date) {
  return new Promise(function (resolve) {
    const promiseArray = [];
    JourSondage.addJourSondage(fakeSurvey_id, simulationDay, users.length);
    users.forEach((user) => {
      if (rand(3) !== 0) {
        promiseArray.push(answerSondage_simulation(user, date));
      }
    });
    Promise.all(promiseArray).then(() => {
      resolve();
    });
  });
};

const answerAll = function () {
  return new Promise(function (resolve) {
    Sondage.findOne({ where: { name: fakeSurvey.name } }).then(() => {
      User.findAll().then((users) => {
        answerUserListSondage_simulation(users, simulationDay).then(() => {
          resolve();
        });
      });
    });
  });
};

const firstDay = function () {
  return new Promise(function (resolve) {
    Admin.addAdmin('Vince', 'Vince').then(() => {
      addManyUsers(10).then(() => {
        Admin.findOne({ where: { pseudo: 'Vince' } }).then((admin) => {
          admin.createSondage(fakeSurvey).then((sondage_id) => {
            Sondage.update({ current: true }, { where: { id: sondage_id } });
            getQuestionIdList(sondage_id).then(() => {
              answerAll().then(() => { 
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

const day = function (numberAddeduser) {
  return new Promise(function (resolve) {
    addManyUsers(numberAddeduser).then(() => {
      answerAll().then(() => {
        incrementDay();
        resolve();
      });
    });
  });
};

const Alldays = function (compteur) {
  if (compteur === 0) {
    console.log(' -- fin --');
    User.count().then((sum) => {
      console.log("user :", sum);
    });
    Remplissage.count().then((sum) => {
      console.log("remplissage :", sum);
    });
    Reponse.count().then((sum) => {
      console.log("reponses :", sum);
    });
  } else {
    compteur--;
    console.log(compteur);
    if (compteur <= 15) {
      day(rand(2)).then(() => {
        Alldays(compteur);
      });
    } else {
      day(rand(5)).then(() => {
        Alldays(compteur);
      });
    }
  }
};

clearTables().then(() => {
  console.log("");
  console.log("------------------------------------------");
  console.log("");
  firstDay().then(() => {
    Alldays(simulationTime);
  });
});
