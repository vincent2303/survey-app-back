const Models = require('./index');

Models.Admin.findOne().then((admin) => {
  admin.getStatistics((result) => {
    console.log(result);
  });
});