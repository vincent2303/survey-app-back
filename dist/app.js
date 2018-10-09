"use strict";

var express = require('express');

var http = require('http');

var cors = require('cors');

var session = require('express-session');

var FileStore = require('session-file-store')(session);

var passport = require('passport');

var cookieParser = require('cookie-parser');

var env = require('./const');

var scheduler = require('./mail/timer.js');

var id_generator = require('./custom_module/id_generator');

var adminRouter = require('./routes/admin');

var usersRouter = require('./routes/user');

var userPageRouter = require('./routes/userPage');

var loginRouter = require('./routes/login');

var app = express();
console.log('Starting scheduler');
scheduler();
var corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
};
app.use(express.static('public'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser(env.session_secret_key));
app.use(session({
  genid: function genid(req) {
    console.log('Inside the session middleware');
    console.log(req.sessionID);
    return id_generator(); // use UUIDs for session IDs
  },
  store: new FileStore(),
  secret: env.session_secret_key,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 2419200000
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/user', usersRouter);
app.use('/login', loginRouter);
app.use('/userPage', userPageRouter);
app.use('/admin', adminRouter);
app.set('port', env.port);
var server = http.createServer(app);
console.log("server starting on port: 4200");
server.listen(env.port);
module.exports = app;
//# sourceMappingURL=app.js.map