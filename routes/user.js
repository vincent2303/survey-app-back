const express = require('express');

const router = express.Router();

// Le body Parser permet d'acceder aux variable envoyés dans le body
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(express.urlencoded({ extended: false }));

const morgan = require('morgan');

router.use(morgan('dev'));

// Récupère les models
const Models = require('../models');

router.use((req, res, next) => {
  if (!req.isAuthenticated() && req.url !== '/login') {
    res.status(401).json({ message: 'Not logged in' });
  } else {
    next();
  }
});

// --------- Routes protegées-------------

router.post('/updateUser', (req, res) => {
  const newCookie = Object.assign(req.user, req.body.updatedUser);
  req.login(newCookie, (err) => {
    console.log("successfull login: ", newCookie);
  });
  Models.User.updateUser(req.user.id, req.body.updatedUser).then(() => {
    res.status(200).json(req.body.updatedUser);
  });
});

router.get('/getToken', (req, res) => {
  Models.Sondage.findOne({ where: { current: true } }).then((sondage) => {
    Models.User.findOne({ where: { id: req.user.id } })
      .then((user) => {
        const sondage_id = sondage.dataValues.id;
        const token = user.generateJwt(sondage_id);
        res.status(200).send({ token: token });
      });
  });
});
 
module.exports = router;