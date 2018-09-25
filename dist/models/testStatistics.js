"use strict";

var Models = require('./index');

Models.Admin.findOne().then(function (admin) {
  admin.getStatistics(function (result) {
    console.log(result);
  });
});
//# sourceMappingURL=testStatistics.js.map