const express = require('express');
const http = require('http');
const cors = require('cors');

const env = require('./const');
const scheduler = require('./mail/timer.js');

const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/user');

const app = express();
app.use(cors());

console.log('Starting scheduler');
scheduler();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());


app.use('/user', usersRouter);
app.use('/admin', adminRouter);

app.set('port', env.port);

const server = http.createServer(app);

console.log(`server starting on port: ${env.port}`);
server.listen(env.port);