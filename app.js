const express = require('express');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const cookieParser = require('cookie-parser');

const env = require('./const');
const scheduler = require('./mail/timer.js');
const id_generator = require('./custom_module/id_generator');

const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/user');
const userPageRouter = require('./routes/userPage');

const app = express();

console.log('Starting scheduler');
scheduler();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(env.session_secret_key));
app.use(session({
  genid: (req) => {
    console.log('Inside the session middleware');
    console.log(req.sessionID);
    return id_generator(); // use UUIDs for session IDs
  },
  store: new FileStore(),
  secret: env.session_secret_key,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 2419200000 },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/user', usersRouter);
app.use('/userPage', userPageRouter);
app.use('/admin', adminRouter);

app.set('port', env.port);

const server = http.createServer(app);

console.log(`server starting on port: 4200`);
server.listen(env.port);

module.exports = app;
