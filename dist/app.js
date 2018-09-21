"use strict";

console.log('lecture server');

var express = require('express');

var http = require('http');

var cors = require('cors');

var env = require('./const');

var scheduler = require('./mail/timer.js');

var adminRouter = require('./routes/admin');

var usersRouter = require('./routes/user');

var app = express();
app.use(cors());
console.log('Starting scheduler');
scheduler();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use('/user', usersRouter);
app.use('/admin', adminRouter);
app.set('port', env.port);
var server = http.createServer(app);
console.log("server starting on port: 4200");
server.listen(env.port);
module.exports = app;
//# sourceMappingURL=app.js.map