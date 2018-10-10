
const express = require('express');
const passport = require('passport');

const router = express.Router();


// Le body Parser permet d'acceder aux variable envoyés dans le body
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(express.urlencoded({ extended: false }));

const morgan = require('morgan');

router.use(morgan('dev'));

// Authentification
const loginStrategy = require('../passport-config/adminStrategy');

passport.use(loginStrategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  done(null, id);
});

router.post('/',
  passport.authenticate('local', { session: true }),
  (req, res) => {
    switch (req.user) {
      case "wrongUser":
        res.status(401).json({ message: "Wrong username" });
        break;
      case "wrongPass":
        res.status(401).json({ message: "Wrong password" });
        break;
      default:
        req.login(req.user, (err) => {
          console.log("successfull login");
        });
        const serverResponse = { 
          success: true, 
          admin: { pseudo: req.user.dataValues.pseudo },
        };
        res.json(serverResponse);
    }
  });

// Check if a user is logged in

router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(true);
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});
// Logout the session

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.send("User logged out");
});

module.exports = router;