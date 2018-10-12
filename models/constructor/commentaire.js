const Sequelize = require('sequelize');
const id_generator = require('../../custom_module/id_generator');

const commentaireConstructor = function (sequelize) {
  const Commentaire = sequelize.define('commentaire', {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    },
    remplissage_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    thematique_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    commentaire: {
      allowNull: false,
      type: Sequelize.STRING,
    },
  }, {
    timestamps: false,
  });
  Commentaire.addCommentaire = function (remplissage_id, thematique_id, commentaire) {
    return new Promise(function (resolve) {
      Commentaire.sync().then(() => {
        Commentaire.create({
          id: id_generator(),
          remplissage_id: remplissage_id,
          thematique_id: thematique_id,
          commentaire: commentaire,
        }).then(() => {
          resolve();
        });
      });
    });
  };

  Commentaire.updateCommentaire = function (commentaire_id, newCommentaire) {
    Commentaire.update(
      { commentaire: newCommentaire },
      { where: { id: commentaire_id } },
    );
  };
  return Commentaire;
};

module.exports = commentaireConstructor;