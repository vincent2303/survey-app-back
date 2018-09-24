const Models = require("./index");

const { 
  Sondage, Thematique, User, Reponse, Question, Remplissage, Admin, JourSondage, Commentaire,
} = Models;

const alert = function () {
  console.log("");
  console.log("");
  console.log(" ********* toutes les tables ont été crée *********");
  console.log("");
};

// setup: créer les tables avec 1 fausse valeur dans chaque
const creationTable = function () {
  Admin.sync({ force: true }).then(() => {
    Admin.create({
      id: "fake_admin_id",
      pseudo: "fake_pseudo",
      salt: "fake_salt",
      hash: "fake_hash",
      createdAt: Date.now(),
    });
  }).then(() => {
    User.sync({ force: true }).then(() => {
      User.create({
        id: "fake_user_id",
        firstName: "fake_first_name",
        lastName: "fake_last_name",
        email: "fake_user_email@fake_mail.bite",
        lastMailDate: Date.now(),
        mailIntensity: 1,
      });
    }).then(() => {
      Sondage.sync({ force: true }).then(() => {
        Sondage.create({
          id: "fake_sondage_id",
          author: "fake_author",
          createdAt: Date.now(),
          name: "fake_name",
          current: true,
        });
      }).then(() => {
        JourSondage.sync({ force: true }).then(() => {
          JourSondage.create({
            id: "fake_jour_sondage_id",
            sondage_id: "fake_sondage_id",
            date_emmission: Date.now(),
            nombre_emission: 1,
          });
        });
        Thematique.sync({ force: true }).then(() => {
          Thematique.create({
            id: "fake_thematique_id",
            name: "fake_name",
          });
        }).then(() => {
          Question.sync({ force: true }).then(() => {
            Question.create({
              id: "fake_question_id",
              sondage_id: "fake_sondage_id",
              valeur: "fake_question",
              thematique_id: "fake_thematique_id",
              keyWord: "fake_keyWord",
            });
          }).then(() => {
            Remplissage.sync({ force: true }).then(() => {
              Remplissage.create({
                id: "fake_remplissage_id",
                sondage_id: "fake_sondage_id",
                user_id: "fake_user_id",
                date: Date.now(),
              });
            }).then(() => {
              Commentaire.sync({ force: true }).then(() => {
                Commentaire.create({
                  id: "fake_commentaire_id",
                  remplissage_id: "fake_remplissage_id",
                  thematique_id: "fake_thematique_id",
                  commentaire: "fake_commentaire",
                });
              }).then(() => {
                Reponse.sync({ force: true }).then(() => {
                  Reponse.create({
                    id: "fake_reponse_id",
                    remplissage_id: "fake_remplissage_id",
                    question_id: "fake_question_id",
                    valeur: 0,
                  });
                }).then(() => {
                });
              });
            });
          });
        });
      });
    });
  });
};

const setupTables = function () {
  const commentaireDel = new Promise(function (resolve) {
    Commentaire.drop().then(() => {
      console.log('table commentaire supprimée');
      resolve();
    });
  });

  const reponseDel = new Promise(function (resolve) {
    Reponse.drop().then(() => {
      console.log('table reponse supprimée');
      resolve();
    });
  });

  const jourSondageDel = new Promise(function (resolve) {
    JourSondage.drop().then(() => {
      console.log('table jour sondage supprimée');
      resolve();
    });
  });

  Promise.all([commentaireDel, reponseDel, jourSondageDel]).then(() => {
    const questionDel = new Promise(function (resolve) {
      Question.drop().then(() => {
        console.log('table question supprimée');
        resolve();
      });
    });
    const remplissageDel = new Promise(function (resolve) {
      Remplissage.drop().then(() => {
        console.log('table remplissage supprimée');
        resolve();
      });
    });
    Promise.all([questionDel, remplissageDel]).then(() => {
      const thematiqueDel = new Promise(function (resolve) {
        Thematique.drop().then(() => {
          console.log('table thematique supprimée');
          resolve();
        });
      });
      const userDel = new Promise(function (resolve) {
        User.drop().then(() => {
          console.log('table user supprimée');
          resolve();
        });
      });
      Promise.all([thematiqueDel, userDel]).then(() => {
        Sondage.drop().then(() => {
          console.log('table sondage supprimée');
          Admin.drop().then(() => {
            console.log('table admin supprimée');
            console.log(" -- anciennes tables supprimées, création des nouvelles --");
            creationTable();
          });
        });
      });
    });
  });
};

setupTables();
