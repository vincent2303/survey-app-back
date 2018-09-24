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
    console.log("info: ", req.user);
    Models.User.findOne({ where: { id: req.user.user_id } }).then((user) => {
      user.findSondage(req, (serverResponse) => {
        console.log("Sending current sondage to front");
        res.status(200).json(serverResponse);
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
        Models.User.findById(user_id).then((user) => {
          const sondage = { 
            sondage_id: sondage_id,
            remplissage_id: remplissage_id,
            answered_questions: req.body.answered_questions,
            answered_commentaires: req.body.answered_commentaires,
          };
          user.updateSondage(sondage);
          console.log(req.user.firstName, " already answered and changed his answers");
          res.status(200).send({ msg: "Merci d'avoir modifier votre reponse !" });
        });
      } else {
        Models.User.findById(user_id).then((user) => {
          const sondage = { 
            sondage_id: sondage_id,
            remplissage_id: remplissage_id,
            answered_questions: req.body.answered_questions,
            answered_commentaires: req.body.answered_commentaires,
          };
          user.answerSondage(sondage);
          console.log("New remplissage submitted by: ", req.user.firstName);
          res.status(200).send({ msg: "Merci d'avoir repondu au sondage !" });
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