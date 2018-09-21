const express = require('express');

const router = express.Router();


// Le body Parser permet d'acceder aux variable envoyés dans le body
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(express.urlencoded({ extended: false }));

const morgan = require('morgan');

// Authentification
const passport = require('passport');
const adminLoginStrategy = require('../passport-config/adminStrategy');

passport.use(adminLoginStrategy);
passport.initialize();

// App variables
const env_var = require('../variables');

// Authentification controllers
const checkToken = require('../controllers/adminCheckToken');

// Récupère les models
const Models = require('../models/index');

// Récupère les fonctions de recherche de données
const Data = require('../models/dataFetch');

router.use(morgan('dev'));


// L'administrateur peut poster un User pour l'ajouter dans la DB
// Les attributs de l'utilisateurs sont dans le body de la requête
router.post('/createUser', (req, res) => {
  // On vérifie que les données minmums pour créer un utilisateur sont bien présentes
  if (!req.body.firstName || !req.body.lastName || !req.body.email) {
    console.log("/!\\ ERROR : The body of the create user request doesnt contain first name or last name or email !");
    res.status(400).send("Bad Request : The body of the create user request doesnt contain first name or last name or email ! ");
  } else {
    console.log(`creating user ${req.body.firstName} ${req.body.lastName}`);
    Models.User.addUser(req.body.firstName, req.body.lastName, req.body.email, (id) => {
      res.status(200).send({
        id: id, firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email,
      });
    });
  }
});

router.post('/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    switch (req.user) {
      case "wrongUser":
        res.status(460).send("Wrong username");
        break;
      case "wrongPass":
        res.status(461).send("Wrong username");
        break;
      default:
        console.log("correct auth");
        const serverResponse = { 
          success: true, 
          admin: { pseudo: req.user.dataValues.pseudo },
          token: req.user.generateJwt(),
        };
        res.json(serverResponse);
    }
  });

// --------- Routes protegées par token -------------

// Un administrateur peut ajouter un autre administrateur :
// Les attributs de l'admin sont dans le body de la requète
// TODO : Prendre en compte le cas où il y a une erreure au cours de la création de l'admin'

// Routes relatives a la gestion des admins et des users
router.post('/createAdmin', checkToken, (req, res) => {
  console.log(`creating admin ${req.body.pseudo}`);
  console.log(req.body);
  // On vérifie que les données minmums pour créer un utilisateur sont bien présentes
  if (!req.body.pseudo || !req.body.mp) {
    console.log("/!\\ ERROR : The body of the create admin request doesnt contain pseudo or mp !");
    res.status(400).send("Bad Request : The body of the create admin request doesnt contain pseudo or mp ! ");
  } else {
    Models.Admin.addAdmin(req.body.pseudo, req.body.mp, () => {
      console.log(`Added: ${req.body.pseudo}`);
      res.status(200).send(`User ${req.body.firstName} ${req.body.lastName} created`);
    });
  }
});

router.post('/csvPost',
  checkToken,
  (req, res) => {
    req.body.userList.forEach((user) => {
      Models.User.addUser(user.firstName, user.lastName, user.email, () => {});
    });
    res.json("user list added");
  });

router.post('/singlePost',
  checkToken,
  (req, res) => {
    const user = req.body.user;
    Models.User.addUser(user.firstName, user.lastName, user.email, () => {
      res.send("single user added");
    });
  }); 

// Route relative à l'affichage et la creation de sondage

router.get('/getSondage', checkToken, (req, res) => {
  Models.Admin.findOne({ where: { id: req.user.id } }).then((admin) => {
    admin.getSondage(sondageList => res.status(200).json(sondageList));
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
router.post('/postSondage', checkToken, (req, res) => {
  Models.Admin.findOne({ where: { id: req.user.id } }).then((admin) => {
    admin.createSondage(req.body, () => res.status(200).send("New sondage created"));
  });
});

router.post('/changeNextSondage', checkToken, (req, res) => {
  console.log(req.body);
  if (!req.body) {
    console.log("/!\\ ERROR : Inccorect body");
    res.status(400).send("Bad Request : The body doesnt contain next_sondage ! ");
  } else {
    env_var.next_sondage = req.body.id;
    console.log("Changed the sondage to sondage number: ", req.body);
    res.status(200).json(env_var.next_sondage);
  }
});

// Route relative aux statisques

router.get('/numberRemplissages', checkToken, (req, res) => {
  console.log(env_var.next_sondage);
  Data.getNumberRemplissages((count) => {
    res.status(200).json(count);
  });
});

router.get('/numberRemplissagesJour/:jour', checkToken, (req, res) => {
  Data.getNumberRemplissagesJour(req.params.jour, (count) => {
    res.status(200).json(count);
  });
});

router.get('/getCommentaireJour/:jour', checkToken, (req, res) => {
  Data.getCommentairesJour(req.params.jour, (comments) => {
    res.status(200).json(comments);
  });
});

router.get('/numberReponses', checkToken, (req, res) => {
  Data.getNumberReponses((count) => {
    res.status(200).json(count);
  });
});

router.get('/numberReponsesJour/:jour', checkToken, (req, res) => {
  Data.getNumberReponsesJour(req.params.jour, (count) => {
    res.status(200).json(count);
    // router.get("/generalStatistics", checkToken, (req, res) => {
    //   Models.Admin.findById(req.user.id).then((admin) => {
    //     console.log(admin.getStatistics());
  });
  res.json("ok");
});

router.get("/generalStatistics", (req, res) => {
  Models.Admin.findById('fake_admin_id').then((admin) => {
    admin.getStatistics((statistics) => {
      res.json(statistics);
    });
  });
});

router.use((err, req, res) => {
  console.log("error: ", err.name);
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ message: 'Unauthorized. Invalid token!' });
  }
});


module.exports = router;
