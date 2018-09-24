const schedule = require('node-schedule');
const Models = require('../models/index.js');
const mailer = require('./mailer');

const scheduler = function () {
  schedule.scheduleJob('0 * * * * *', () => {
    console.log("Trying to send mail at: ", Date.now());

    Models.User.findAll().then((users) => {
      users.forEach((data) => {
        Models.Sondage.findAll({ limit: 1 }).then((sondage) => {
          const sondage_id = sondage[0].dataValues.id;
          const token = data.generateJwt(sondage_id);
          const diff = Date.now() - data.dataValues.lastMailDate;
          if (data.dataValues.mailIntensity < diff / (1000 * 60 * 60 * 24) + 0.4) {
            console.log(`Sending mail to: ${data.dataValues.lastName}`);
            mailer(data.dataValues, token);
            Models.User.update(
              { lastMailDate: Date.now() },
              { where: { id: data.dataValues.id } },

            );
          }
        });
      });
    });

    /**/
  });
};
module.exports = scheduler;
