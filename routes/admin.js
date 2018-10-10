const express = require('express');

const router = express.Router();


// Le body Parser permet d'acceder aux variable envoyés dans le body
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(express.urlencoded({ extended: false }));

const morgan = require('morgan');

// Récupère les models
const Models = require('../models/index');

router.use(morgan('dev'));

router.use((req, res, next) => {
  if (req.url === '/login') {
    next();
  } else if (!req.isAuthenticated()) {
    res.status(401).json({ message: 'Not logged in' });
  } else if (req.user.auth !== 1) {
    res.status(401).json({ message: 'Not authorized' });
  } else {
    next();
  }
});

// --------- Routes protegées par token -------------

// Un administrateur peut ajouter un autre administrateur :
// Les attributs de l'admin sont dans le body de la requète
// TODO : Prendre en compte le cas où il y a une erreure au cours de la création de l'admin'

// Routes relatives a la gestion des admins et des users
/* router.post('/createAdmin', (req, res) => {
  console.log(`creating admin ${req.body.pseudo}`);
  // On vérifie que les données minmums pour créer un utilisateur sont bien présentes
  if (!req.body.pseudo || !req.body.mp) {
    console.log("/!\\ ERROR : The body of the create admin request doesnt contain pseudo or mp !");
    res.status(400).send("Bad Request : The body of the create admin request doesnt contain pseudo or mp ! ");
  } else {
    Models.Admin.addAdmin(req.body.pseudo, req.body.mp, Date.now()).then(() => {
      console.log(`Added admin: ${req.body.pseudo}`);
      res.status(200).send(`Admin ${req.body.pseudo} created`);
    });
  }
}); */

router.post('/csvPost',
  (req, res) => {
    const promises = [];
    req.body.userList.forEach((user) => {
      promises.push(Models.User.addUser(user.firstName, user.lastName, user.email));
    });
    Promise.all(promises).then(res.status(200).json("User list added"));
  });

router.post('/singlePost',
  (req, res) => {
    Models.User.addUser(
      req.body.firstName, 
      req.body.lastName, 
      req.body.email, 
      req.body.pseudo,
      req.body.password,
      req.body.auth,
    ).then(() => {
      res.status(200).send("New user added");
      console.log("New user added: ", req.body.pseudo);
    });
  }); 

// Route relative à l'affichage et la creation de sondage

router.get('/getSondage', (req, res) => {
  Models.User.findOne({ where: { id: req.user.id } }).then((user) => {
    user.getSondage().then((sondageList) => {
      console.log("Sent all sondages to client");
      res.status(200).json(sondageList);
    });
  });
});

/* Survey object sent from the front to /postSondage
  {
    name: sondagename,
    thematiqueList: [
      {
        name: thematiquename,
        questionList: [
          {
            keyWord: motclef,
            question: question,
          },
          { ... },
        ]
      },
      { ... },
    ]
  }
*/
router.post('/postSondage', (req, res) => {
  Models.User.findOne({ where: { id: req.user.id } }).then((user) => {
    user.createSondage(req.body).then(() => {
      console.log("New sondage created: ", req.body.name);
      res.status(200).send("New sondage created");
    });
  });
});

router.post('/changeNextSondage', (req, res) => {
  if (!req.body) {
    console.log("/!\\ ERROR : Inccorect body");
    res.status(400).send("Bad Request : The body doesnt contain next_sondage ! ");
  } else {
    Models.Sondage.update({ current: false }, { where: { current: true } }).then(() => {
      Models.Sondage.update({ current: true }, { where: { id: req.body.id } }).then((sondage) => {
        console.log("Changed the sondage to sondage: ", req.body.name);
        res.status(200).json(sondage.dataValues);
      });
    });
  }
});

// Route relative aux statisques

router.get('/getCommentaireJour/:jour', (req, res) => {
  Models.User.findById(req.user.id).then((user) => {
    user.getCommentairesJour(req.params.jour).then((comments) => {
      console.log("Fetching all Commentaires on: ", req.params.jour);
      res.status(200).json(comments);
    });
  });
});

router.get("/generalStatistics", (req, res) => {
  Models.User.findById(req.user.id).then((user) => {
    user.getStatistics((statisticTab) => {
      res.json(statisticTab);
    });
  });
});

router.get("/specificStatistics/:year/:month/:day", (req, res) => {
  Models.User.findById(req.user.id).then((user) => {
    user.getStatisticsSpecific(req.params).then((sondageResult) => {
      res.json(sondageResult);
    });
  });
});

module.exports = router;