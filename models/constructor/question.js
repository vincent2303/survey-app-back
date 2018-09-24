const Sequelize = require('sequelize');
const id_generator = require('../../custom_module/id_generator');

const questionConstructor = function (sequelize) {
  const Question = sequelize.define('question', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    },
    sondage_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    thematique_id: {
      allowNull: false,
      type: Sequelize.STRING,  
    },
    valeur: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    keyWord: {
      allowNull: false,
      type: Sequelize.STRING,
    },
  }, {
    timestamps: false,
  });
  Question.addQuestion = function (sondage_id, thematique_id, valeur, keyWord) {
    return new Promise(function (resolve) {
      Question.sync().then(() => {
        Question.create({
          id: id_generator(),
          thematique_id: thematique_id,
          sondage_id: sondage_id,
          valeur: valeur,
          keyWord: keyWord,
        }).then(() => {
          resolve();
        }); 
      });
    });
  };
  return Question;
};

module.exports = questionConstructor;