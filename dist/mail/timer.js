"use strict";

var schedule = require('node-schedule');

var Models = require('../models/index.js');

var mailer = require('./mailer');

var scheduler = function scheduler() {
  schedule.scheduleJob('0 * * * * *', function () {
    console.log("Trying to send mail at: ", Date.now());
    Models.User.findAll().then(function (users) {
      users.forEach(function (data) {
        Models.Sondage.findOne({
          where: {
            current: true
          }
        }).then(function (sondage) {
          var sondage_id = sondage.dataValues.id;
          var token = data.generateJwt(sondage_id);
          var diff = Date.now() - data.dataValues.lastMailDate;

          if (data.dataValues.mailIntensity < diff / (1000 * 60 * 60 * 24) + 0.4) {
            console.log("Sending mail to: ".concat(data.dataValues.lastName));
            mailer(data.dataValues, token);
            Models.User.update({
              lastMailDate: Date.now()
            }, {
              where: {
                id: data.dataValues.id
              }
            });
          }
        });
      });
    });
    /**/
  });
};

module.exports = scheduler;
//# sourceMappingURL=timer.js.map