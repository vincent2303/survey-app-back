const Models = require("./index");

Models.Admin.addAdmin('Rayman', 'Glubox', Date.now()).then(() => {
  console.log(" $$$$$$$$ added $$$$$$$$");
});