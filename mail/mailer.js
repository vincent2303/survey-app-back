const nodemailer = require('nodemailer');
const mail = require('./template');

const mailer = function (User, token) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'campushappiness2@gmail.com',
      pass: 'campusbonheur',
    },
  });

  // setup email data with unicode symbols
  const mailOptions = {
    from: '"Campus happyness team" <campushapiness2@gmail.com>', // sender address
    to: User.email, // list of receivers
    subject: `Nous avons besoin de votre avis ${User.firstName}?`, // Subject line
    html: mail(encodeURIComponent(token), User),
    text: `Magic link: http://localhost:3000/sondage/?token=${encodeURIComponent(token)}`,
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
};
module.exports = mailer;
