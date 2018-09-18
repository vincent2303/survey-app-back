const express = require('express');
const Models = require('../models/index');
const userCheckToken = require('../controllers/userCheckToken');

const router = express.Router();

// front send un get avec header
router.get('/getSondage',
  userCheckToken,
  (req, res) => {
    const { sondage_id, remplissage_id } = req.user;
    const serverResponse = { alreadyAnswered: false };
    Models.Remplissage.findOne({ where: { id: remplissage_id } }).then((remplissage) => {
      Models.Question.findAll({ where: { sondage_id: sondage_id } }).then((questions) => {
        const questionList = [];
        questions.forEach((question) => {
          questionList.push(question);
        });
        serverResponse.questionList = questionList; 
        
        // Si le sondage a déjà été remplis, on renvois les réponses
        if (remplissage) {
          serverResponse.alreadyAnswered = true;
          Models.Reponse.findAll({ where: { remplissage_id: remplissage_id } }).then((reponses) => {
            const reponseList = [];
            reponses.forEach((reponse) => {
              reponseList.push(reponse);
            }); 
            serverResponse.reponseList = reponseList;
            res.json(serverResponse);
          }); 
        } else {
          res.json(serverResponse);
        }
      }); 
    });
  });


// front send un post avec header et dans le body un answered_questions (cf index.js)
router.post('/answerSondage',
  userCheckToken,
  (req, res) => {
    const { user_id, sondage_id, remplissage_id } = req.user;
    Models.Remplissage.findById(remplissage_id).then((remplissage) => {
      if (remplissage) {
        res.send({ msg: "Vous aviez dejas repondue au sondage..." });
      } else {
        Models.User.findById(user_id).then((user) => {
          const sondage = { 
            sondage_id: sondage_id,
            remplissage_id: remplissage_id,
            answered_questions: req.body.answered_questions, 
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

module.exports = router;
