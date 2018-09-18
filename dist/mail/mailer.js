"use strict";

var nodemailer = require('nodemailer');

var mailer = function mailer(User, token) {
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    // true for 465, false for other ports
    auth: {
      user: 'campushappiness2@gmail.com',
      pass: 'campusbonheur'
    }
  }); // setup email data with unicode symbols

  var mailOptions = {
    from: '"Campus happyness team" <campushapiness2@gmail.com>',
    // sender address
    to: User.email,
    // list of receivers
    subject: "Voules vous mangez des gros chibres ".concat(User.firstName, "?"),
    // Subject line
    html: "<h1>Magic link \uD83C\uDFA9 !</h1>\n                <a href=\"http://localhost:3000/sondage/?token=".concat(encodeURIComponent(token), "\">\n                YOUHOU\n                </a>"),
    text: "Magic link: http://localhost:3000/sondage/?token=".concat(encodeURIComponent(token))
  }; // send mail with defined transport object

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }

    console.log('Message sent: %s', info.messageId);
  });
};

module.exports = mailer;
//# sourceMappingURL=mailer.js.map