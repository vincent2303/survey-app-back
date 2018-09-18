"use strict";

var express = require('express');

var router = express.Router(); // Le body Parser permet d'acceder aux variable envoyés dans le body

var bodyParser = require('body-parser');

router.use(bodyParser.json()); // Authentification

var passport = require('passport');

var adminLoginStrategy = require('../passport-config/adminStrategy');

passport.use(adminLoginStrategy);
passport.initialize(); // Authentification controllers

var checkToken = require('../controllers/adminCheckToken'); // Récupère les models


var Models = require('../models/index'); // Récupère les fonctions de recherche de données


var Data = require('../models/dataFetch'); // L'administrateur peut poster un User pour l'ajouter dans la DB
// Les attributs de l'utilisateurs sont dans le body de la requête


router.post('/createUser', function (req, res) {
  // On vérifie que les données minmums pour créer un utilisateur sont bien présentes
  if (!req.body.firstName || !req.body.lastName || !req.body.email) {
    console.log("/!\\ ERROR : The body of the create user request doesnt contain first name or last name or email !");
    res.status(400).send("Bad Request : The body of the create user request doesnt contain first name or last name or email ! ");
  } else {
    console.log("creating user ".concat(req.body.firstName, " ").concat(req.body.lastName));
    Models.User.addUser(req.body.firstName, req.body.lastName, req.body.email, function (id) {
      res.status(200).send({
        id: id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
      });
    });
  }
});
router.post('/login', passport.authenticate('local', {
  session: false
}), function (req, res) {
  switch (req.user) {
    case "wrongUser":
      res.status(460).send("Wrong username");
      break;

    case "wrongPass":
      res.status(461).send("Wrong username");
      break;

    default:
      console.log("correct auth");
      var serverResponse = {
        success: true,
        admin: {
          pseudo: req.user.dataValues.pseudo
        },
        token: req.user.generateJwt()
      };
      res.json(serverResponse);
  }
}); // --------- Routes protegées par token -------------
// Un administrateur peut ajouter un autre administrateur :
// Les attributs de l'admin sont dans le body de la requète
// TODO : Prendre en compte le cas où il y a une erreure au cours de la création de l'admin'

router.post('/createAdmin', checkToken, function (req, res) {
  console.log("creating admin ".concat(req.body.pseudo));
  console.log(req.body); // On vérifie que les données minmums pour créer un utilisateur sont bien présentes

  if (!req.body.pseudo || !req.body.mp) {
    console.log("/!\\ ERROR : The body of the create admin request doesnt contain pseudo or mp !");
    res.status(400).send("Bad Request : The body of the create admin request doesnt contain pseudo or mp ! ");
  } else {
    Models.Admin.addAdmin(req.body.pseudo, req.body.mp, function () {
      console.log("Added: ".concat(req.body.pseudo));
      res.status(200).send("User ".concat(req.body.firstName, " ").concat(req.body.lastName, " created"));
    });
  }
});
router.post('/csvPost', checkToken, function (req, res) {
  req.body.userList.forEach(function (user) {
    Models.User.addUser(user.firstName, user.lastName, user.email, function () {});
  });
  res.json("user list added");
});
router.post('/singlePost', checkToken, function (req, res) {
  var user = req.body.user;
  Models.User.addUser(user.firstName, user.lastName, user.email, function () {
    res.send("single user added");
  });
});
router.get('/numberSondages', function (req, res) {
  Data.getNumberSondages(function (count) {
    res.status(200).json(count);
  });
});
router.get('/numberSondagesJour/:jour', function (req, res) {
  Data.getNumberSondagesJour(req.params.jour, function (count) {
    res.status(200).json(count);
  });
});
router.get('/numberReponses', function (req, res) {
  Data.getNumberReponses(function (count) {
    res.status(200).json(count);
  });
});
router.get('/numberReponsesJour/:jour', function (req, res) {
  Data.getNumberReponsesJour(req.params.jour, function (count) {
    res.status(200).json(count);
  });
});
module.exports = router;
//# sourceMappingURL=admin.js.map