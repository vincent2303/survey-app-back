const express = require('express');

const router = express.Router();

// Le body Parser permet d'acceder aux variable envoyés dans le body
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(express.urlencoded({ extended: false }));

const morgan = require('morgan');

router.use(morgan('dev'));

const Models = require('../models/index');
const userCheckToken = require('../controllers/userCheckToken');

// front send un get avec header
router.get('/getSondage',
  userCheckToken,
  (req, res) => {
    const { sondage_id, remplissage_id } = req.user;
    const serverResponse = { alreadyAnswered: false };
    Models.Remplissage.findOne({ where: { id: remplissage_id } }).then((remplissage) => {
      Models.Question.findAll({
        include: [{
          model: Models.Thematique,
        }],
        where: { sondage_id: sondage_id }, 
      }).then((questions) => {
        const questionList = [];
        const thematiqueList = new Map();
        questions.forEach((question) => {
          const quest = JSON.parse(JSON.stringify(question));
          delete quest.thematique;
          if (!thematiqueList.get(question.dataValues.thematique.dataValues.id)) {
            thematiqueList.set(
              question.dataValues.thematique.dataValues.id, 
              question.dataValues.thematique.dataValues,
            );
          }
          const newList = thematiqueList.get(question.dataValues.thematique.dataValues.id);
          if (newList.questionList) {
            newList.questionList.push(quest);
          } else {
            newList.questionList = [quest];
          }
          thematiqueList.set(question.dataValues.thematique.dataValues.id, newList); 
        });
        thematiqueList.forEach((elem) => {
          questionList.push(elem);
        });
        serverResponse.thematiqueList = questionList; 

        // Si le sondage a déjà été remplis, on renvois les réponses
        if (remplissage) {
          serverResponse.alreadyAnswered = true;
          Models.Reponse.findAll({ where: { remplissage_id: remplissage_id } }).then((reponses) => {
            Models.Sondage.findOne({ where: { id: sondage_id } }).then((sondage) => {
              serverResponse.sondageName = sondage.dataValues.name;
              const reponseList = [];
              reponses.forEach((reponse) => {
                reponseList.push(reponse);
              }); 
              serverResponse.reponseList = reponseList;
              res.json(serverResponse);
            });
          }); 
        } else {
          Models.Sondage.findOne({ where: { id: sondage_id } }).then((sondage) => {
            serverResponse.sondageName = sondage.dataValues.name;
            res.json(serverResponse);
          }); 
        }
      }); 
    });
  });


// front send un post avec header et dans le body un answered_questions (cf index.js)
router.post('/answerSondage',
  userCheckToken,
  (req, res) => {
    const { user_id, sondage_id, remplissage_id } = req.user;
    console.log(req.body.answered_questions);
    Models.Remplissage.findById(remplissage_id).then((remplissage) => {
      if (remplissage) {
        res.send({ msg: "Vous aviez deja repondue au sondage..." });
      } else {
        Models.User.findById(user_id).then((user) => {
          const sondage = { 
            sondage_id: sondage_id,
            remplissage_id: remplissage_id,
            answered_questions: req.body.answered_questions,
            answered_commentaires: req.body.answered_commentaires,
          };
          user.answerSondage(sondage);
          res.status(200).send({ msg: "merci d'avoir repondue :)" });
        });
      }
    });
  });

router.post('/changeFreq', userCheckToken, (req, res) => {
  if (typeof (req.body.newIntensity) === "number") {
    Models.User.update(
      { mailIntensity: req.body.newIntensity },
      { where: req.body.user_id },
    ).then(res.send({ msg: "Mail Intensity changed" }));
  }
});

router.use((err, req, res, next) => {
  console.log("error: ", err.name);
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ message: 'Unauthorized. Invalid token!' });
  }
});

module.exports = router;
