"use strict";

var Sequelize = require('sequelize');

var id_generator = require('../../custom_module/id_generator');

var commentaireConstructor = function commentaireConstructor(sequelize) {
  var Commentaire = sequelize.define('commentaire', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true
    },
    remplissage_id: {
      allowNull: false,
      type: Sequelize.STRING
    },
    thematique_id: {
      allowNull: false,
      type: Sequelize.STRING
    },
    commentaire: {
      allowNull: false,
      type: Sequelize.STRING
    }
  });

  Commentaire.addCommentaire = function (remplissage_id, thematique_id, commentaire) {
    Commentaire.sync().then(function () {
      Commentaire.create({
        id: id_generator(),
        remplissage_id: remplissage_id,
        thematique_id: thematique_id,
        commentaire: commentaire
      });
    });
  };

  Commentaire.updateCommentaire = function (commentaire_id, newCommentaire) {
    Commentaire.update({
      commentaire: newCommentaire
    }, {
      where: {
        id: commentaire_id
      }
    });
  };

  return Commentaire;
};

module.exports = commentaireConstructor;
//# sourceMappingURL=commentaire.js.map