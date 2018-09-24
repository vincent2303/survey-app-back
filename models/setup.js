const Models = require("./index");

const { 
  Sondage, Thematique, User, Reponse, Question, Remplissage, Admin, JourSondage, Commentaire,
} = Models;

const creationTable = function () {
  return new Promise(function (resolveAll) {
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
                    console.log("tables créées");
                    resolveAll();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

const suppressionTables = function () {
  return new Promise(function (resolveAll) {
    const commentaireDel = new Promise(function (resolve) {
      Commentaire.drop().then(() => {
        resolve();
      });
    });
      
    const reponseDel = new Promise(function (resolve) {
      Reponse.drop().then(() => {
        resolve();
      });
    });
      
    const jourSondageDel = new Promise(function (resolve) {
      JourSondage.drop().then(() => {
        resolve();
      });
    });
      
    Promise.all([commentaireDel, reponseDel, jourSondageDel]).then(() => {
      const questionDel = new Promise(function (resolve) {
        Question.drop().then(() => {
          resolve();
        });
      });
      const remplissageDel = new Promise(function (resolve) {
        Remplissage.drop().then(() => {
          resolve();
        });
      });
      Promise.all([questionDel, remplissageDel]).then(() => {
        const thematiqueDel = new Promise(function (resolve) {
          Thematique.drop().then(() => {
            resolve();
          });
        });
        const userDel = new Promise(function (resolve) {
          User.drop().then(() => {
            resolve();
          });
        });
        Promise.all([thematiqueDel, userDel]).then(() => {
          Sondage.drop().then(() => {
            Admin.drop().then(() => {
              console.log(" -- anciennes tables supprimées --");
              resolveAll();
            });
          });
        });
      });
    });
  });
};

suppressionTables().then(() => {
  creationTable().then(() => {
    console.log("tables mises à jours");
  });
});