"use strict";

var Models = require("./index");

var Sondage = Models.Sondage,
    Thematique = Models.Thematique,
    User = Models.User,
    Reponse = Models.Reponse,
    Question = Models.Question,
    Remplissage = Models.Remplissage,
    JourSondage = Models.JourSondage,
    Commentaire = Models.Commentaire;

var creationTable = function creationTable() {
  return new Promise(function (resolveAll) {
    User.sync({
      force: true
    }).then(function () {
      User.create({
        id: "fake_user_id",
        firstName: "fake_first_name",
        lastName: "fake_last_name",
        email: "fake_user_email@fake_mail.bite",
        pseudo: "fake_pseudo",
        salt: "fake_salt",
        hash: "fake_hash",
        auth: 0,
        photo: "./public/user/photo/default.jpg",
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
          createdAt: Date.now(),
          name: "fake_name",
          current: true
        });
      }).then(function () {
        JourSondage.sync({
          force: true
        }).then(function () {
          JourSondage.create({
            id: "fake_jour_sondage_id",
            sondage_id: "fake_sondage_id",
            date_emmission: Date.now(),
            nombre_emission: 1
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
              thematique_id: "fake_thematique_id",
              keyWord: "fake_keyWord"
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
              Commentaire.sync({
                force: true
              }).then(function () {
                Commentaire.create({
                  id: "fake_commentaire_id",
                  remplissage_id: "fake_remplissage_id",
                  thematique_id: "fake_thematique_id",
                  commentaire: "fake_commentaire"
                });
              }).then(function () {
                Reponse.sync({
                  force: true
                }).then(function () {
                  Reponse.create({
                    id: "fake_reponse_id",
                    remplissage_id: "fake_remplissage_id",
                    question_id: "fake_question_id",
                    valeur: 0
                  });
                }).then(function () {
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
};

var suppressionTables = function suppressionTables() {
  return new Promise(function (resolveAll) {
    var commentaireDel = new Promise(function (resolve) {
      Commentaire.drop().then(function () {
        resolve();
      });
    });
    var reponseDel = new Promise(function (resolve) {
      Reponse.drop().then(function () {
        resolve();
      });
    });
    var jourSondageDel = new Promise(function (resolve) {
      JourSondage.drop().then(function () {
        resolve();
      });
    });
    Promise.all([commentaireDel, reponseDel, jourSondageDel]).then(function () {
      var questionDel = new Promise(function (resolve) {
        Question.drop().then(function () {
          resolve();
        });
      });
      var remplissageDel = new Promise(function (resolve) {
        Remplissage.drop().then(function () {
          resolve();
        });
      });
      Promise.all([questionDel, remplissageDel]).then(function () {
        var thematiqueDel = new Promise(function (resolve) {
          Thematique.drop().then(function () {
            resolve();
          });
        });
        var userDel = new Promise(function (resolve) {
          User.drop().then(function () {
            resolve();
          });
        });
        Promise.all([thematiqueDel, userDel]).then(function () {
          Sondage.drop().then(function () {
            console.log(" -- anciennes tables supprimées --");
            resolveAll();
          });
        });
      });
    });
  });
};

var setupTables = function setupTables() {
  return new Promise(function (resolve) {
    suppressionTables().then(function () {
      creationTable().then(function () {
        resolve();
      });
    });
  });
};

var delReponse = function delReponse() {
  return new Promise(function (resolve) {
    Reponse.findOne().then(function (elem) {
      elem.destroy().then(resolve);
    });
  });
};

var delCommentaire = function delCommentaire() {
  return new Promise(function (resolve) {
    Commentaire.findOne().then(function (elem) {
      elem.destroy().then(resolve);
    });
  });
};

var delJourSondage = function delJourSondage() {
  return new Promise(function (resolve) {
    JourSondage.findOne().then(function (elem) {
      elem.destroy().then(resolve);
    });
  });
};

var delQuestion = function delQuestion() {
  return new Promise(function (resolve) {
    Question.findOne().then(function (elem) {
      elem.destroy().then(resolve);
    });
  });
};

var delRemplissage = function delRemplissage() {
  return new Promise(function (resolve) {
    Remplissage.findOne().then(function (elem) {
      elem.destroy().then(resolve);
    });
  });
};

var delThematique = function delThematique() {
  return new Promise(function (resolve) {
    Thematique.findOne().then(function (elem) {
      elem.destroy().then(resolve);
    });
  });
};

var delSondage = function delSondage() {
  return new Promise(function (resolve) {
    Sondage.findOne().then(function (elem) {
      elem.destroy().then(resolve);
    });
  });
};

var delUser = function delUser() {
  return new Promise(function (resolve) {
    User.findOne().then(function (elem) {
      elem.destroy().then(resolve);
    });
  });
};

var clearTable = function clearTable() {
  return new Promise(function (resolve) {
    setupTables().then(function () {
      var promises = [];
      promises.push(delReponse(), delCommentaire(), delJourSondage());
      Promise.all(promises).then(function () {
        promises = [delQuestion(), delRemplissage()];
        Promise.all(promises).then(function () {
          promises = [delThematique(), delSondage()];
          Promise.all(promises).then(function () {
            delUser().then(function () {
              console.log("Tables nettoyées");
              resolve();
            });
          });
        });
      });
    });
  });
};

module.exports = clearTable;
//# sourceMappingURL=setup.js.map