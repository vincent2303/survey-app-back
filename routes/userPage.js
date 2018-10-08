const express = require('express');
const passport = require('passport');

const router = express.Router();


// Le body Parser permet d'acceder aux variable envoyés dans le body
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(express.urlencoded({ extended: false }));

const morgan = require('morgan');

router.use(morgan('dev'));

// Récupère les models
const Models = require('../models/index');

// Authentification
const loginStrategy = require('../passport-config/adminStrategy');

passport.use(loginStrategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  done(null, id);
});

router.use((req, res, next) => {
  if (!req.isAuthenticated() && req.url !== '/login') {
    res.status(401).json({ message: 'Unauthorized. User not logged in!' });
  } else {
    next();
  }
});

router.post('/login',
  passport.authenticate('local', { session: true }),
  (req, res) => {
    switch (req.user) {
      case "wrongUser":
        res.status(460).send("Wrong username");
        break;
      case "wrongPass":
        res.status(461).send("Wrong password");
        break;
      default:
        console.log("Correct authentification: ", req.user.dataValues.pseudo);
        req.login(req.user, () => {
          console.log('Inside req.login() callback');
          console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`);
          console.log(`req.user: ${JSON.stringify(req.user)}`);
        });
        const serverResponse = { 
          success: true, 
          user: { email: req.user.dataValues.email },
        };
        res.json(serverResponse);
    }
  });

// --------- Routes protegées-------------

// Logout the session

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.send("User logged out");
});

// Get user

router.get('/getUser', (req, res) => {
  Models.User.findOne({ where: { id: req.user.id } }).then((user) => {
    res.json(user.dataValues.firstName);
  });
});
 
module.exports = router;