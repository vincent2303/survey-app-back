const schedule = require('node-schedule');
const Models = require('../models/index.js');
const mailer = require('./mailer');

const scheduler = function () {
  schedule.scheduleJob('0 * * * * *', () => {
    console.log("timer started at: ", Date.now());

    Models.User.findAll().then((users) => {
      users.forEach((data) => {
        Models.Sondage.findAll().then((sondage) => {
          const sondage_id = sondage[Math.floor(Math.random() * sondage.length)].dataValues.id;
          console.log(sondage_id);
          const token = data.generateJwt(sondage_id);
          const diff = Date.now() - data.dataValues.lastMailDate;
          console.log(diff / (1000 * 60 * 60 * 24) + 0.4, data.dataValues.mailIntensity);

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
