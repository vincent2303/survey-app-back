const nodemailer = require('nodemailer');

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
    subject: `Voules vous mangez des gros chibres ${User.firstName}?`, // Subject line
    html: `<h1>Magic link 🎩 !</h1>
                <a href="http://localhost:3000/sondage/?token=${encodeURIComponent(token)}">
                YOUHOU
                </a>`,
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
