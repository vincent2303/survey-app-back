const Models = require("./index");

// const { User } = Models;

// User.findById("fake_user_id").then((user) => {
//  console.log(user.generateJwt("jo03w008v7y3ye7gay01"));
// });

Models.Admin.addAdmin('foutre', 'mdp');
// const fake_sondage = [
//   {
//     name: "repas",
//     questions: [
//       "Comment était le repas?",
//       "Comment était le prix de ce repas?",
//       "Que pensez vous de l'ambiance dans la cafet?",
//     ],
//   },
//   {
//     name: "bureau",
//     questions: [
//       "Comment etait la temperature",
//       "l'ambiance?",
//       "l'etat des lieux?",
//     ],
//   },
// ];

// Admin.findById("fake_admin_id").then((admin) => {
//   admin.createSondage(fake_sondage);
// });

// const fake_sondage_answer = {
//   sondage_id: "jo03w008v7y3ye7gay01",
// answered_questions: [
//   {
//     question_id: "0jz22yppk1dvuuxodfe7",
//     answer: "bien",
//   },
//   {
//     question_id: "ci4awt7ior3pt0de3lld",
//     answer: "moyen",
//   },
//   {
//     question_id: "grd36g8q1ueb663gw9iy",
//     answer: "mauvais",
//   },
// ],
// };

// User.findById("fake_user_id").then((user) => {
//   user.AnswerSondage(fake_sondage_answer);
// });
