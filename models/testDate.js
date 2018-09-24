const Models = require('./index');

const User = Models.User;
const Admin = Models.Admin;

console.log("");
console.log("");
console.log("");
console.log("--------------------------  log -------------------------- ");
console.log("");
console.log("");
console.log("");

// User.findById('fake_user_id').then((user) => {
//   console.log(user.dataValues.createdAt);
//   console.log(typeof (user.dataValues.createdAt));
//   console.log('instant de creation de user :', user.dataValues.createdAt.getTime());
//   console.log(Date.now());
//   console.log(typeof (Date.now()));
//   // creer date js : annee, mois, jours, heure
//   const customDate1 = new Date(2018, 9, 24);
//   console.log('custom date :', customDate1);
//   const customDate2 = new Date(2018, 9, 25);
//   console.log(customDate2.getTime());
//   console.log(customDate2.getTime() > customDate1.getTime());
// });

const date = new Date(2016, 3, 1);
console.log(date);
for (let i = 0; i < 35; i++) {
  date.setDate(date.getDate() + 1);
  console.log(date);
}