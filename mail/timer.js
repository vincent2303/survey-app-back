const schedule = require('node-schedule');
const Models = require('../models/index.js');
const mailer = require('./mailer');
const id_generator = require('../custom_module/id_generator');

const scheduler = function () {
  schedule.scheduleJob('0 * * * * *', () => {
    Models.Sondage.findOne({ where: { current: true } }).then((sondage) => {
      Models.JourSondage.findOrCreate({ 
        where: { date_emmission: Date.now() },
        defaults: { id: id_generator(), sondage_id: sondage.dataValues.id, nombre_emission: 0 }, 
      }).spread((jourSondage, created) => {
        console.log("Is this the first Sondage sent today: ", created);
        Models.User.findAll().then((users) => {
          users.forEach((data) => {
            const sondage_id = sondage.dataValues.id;
            const token = data.generateJwt(sondage_id);
            const diff = Date.now() - data.dataValues.lastMailDate;
            if (data.dataValues.mailIntensity < diff / (1000 * 60 * 60 * 24) + 0.4) {
              console.log(`Sending mail to: ${data.dataValues.lastName}`);
              mailer(data.dataValues, token);
              Models.User.update(
                { lastMailDate: Date.now() },
                { where: { id: data.dataValues.id } },
              );
              jourSondage.increment({ nombre_emission: 1 });
            }
          });
        });
      });
    });
    /**/
  });
};
module.exports = scheduler;
