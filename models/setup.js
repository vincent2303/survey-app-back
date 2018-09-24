const Models = require("./index");

const { 
  Sondage, Thematique, User, Reponse, Question, Remplissage, Admin, JourSondage, Commentaire,
} = Models;

// setup: créer les tables avec 1 fausse valeur dans chaque
Admin.sync({ force: true }).then(() => {
  Admin.create({
    id: "fake_admin_id",
    pseudo: "fake_pseudo",
    salt: "fake_salt",
    hash: "fake_hash",
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
        date_creation: Date.now(),
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
});
