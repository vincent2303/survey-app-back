"use strict";

var Models = require("./index");

var Sondage = Models.Sondage,
    Thematique = Models.Thematique,
    User = Models.User,
    Reponse = Models.Reponse,
    Question = Models.Question,
    Remplissage = Models.Remplissage,
    Admin = Models.Admin,
    JourSondage = Models.JourSondage; // setup: créer les tables avec 1 fausse valeur dans chaque

Admin.sync({
  force: true
}).then(function () {
  Admin.create({
    id: "fake_admin_id",
    pseudo: "fake_pseudo",
    salt: "fake_salt",
    hash: "fake_hash"
  });
}).then(function () {
  User.sync({
    force: true
  }).then(function () {
    User.create({
      id: "fake_user_id",
      firstName: "fake_first_name",
      lastName: "fake_last_name",
      email: "fake_user_email",
      lastMailDate: Date.now(),
      mailIntensity: 1
    });
  }).then(function () {
    Sondage.sync({
      force: true
    }).then(function () {
      Sondage.create({
        id: "fake_sondage_id",
        author: "fake_author",
        date_creation: Date.now()
      });
    }).then(function () {
      JourSondage.sync({
        force: true
      }).then(function () {
        JourSondage.create({
          id: "fake_jour_sondage_id",
          sondage_id: "fake_sondage_id",
          date_emmission: Date.now()
        });
      });
      Thematique.sync({
        force: true
      }).then(function () {
        Thematique.create({
          id: "fake_thematique_id",
          name: "fake_name"
        });
      }).then(function () {
        Question.sync({
          force: true
        }).then(function () {
          Question.create({
            id: "fake_question_id",
            sondage_id: "fake_sondage_id",
            valeur: "fake_question",
            thematique_id: "fake_thematique_id"
          });
        }).then(function () {
          Remplissage.sync({
            force: true
          }).then(function () {
            Remplissage.create({
              id: "fake_remplissage_id",
              sondage_id: "fake_sondage_id",
              user_id: "fake_user_id",
              date: Date.now()
            });
          }).then(function () {
            Reponse.sync({
              force: true
            }).then(function () {
              Reponse.create({
                id: "fake_reponse_id",
                remplissage_id: "fake_remplissage_id",
                question_id: "fake_question_id",
                valeur: "fake_valeur"
              });
            }).then(function () {
              console.log("");
              console.log("");
              console.log(" ********* toutes les tables ont été crée *********");
              console.log("");
            });
          });
        });
      });
    });
  });
});
//# sourceMappingURL=setup.js.map