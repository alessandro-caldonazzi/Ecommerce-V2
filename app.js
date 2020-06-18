const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('session-jwt');
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session.middleware);
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);

session.settings("segreto", ["/dashboard", '/temporarypassword'], "/auth/login", {
    "refreshUrl": "/auth/refresh",
    "blacklisting": true,
    "JwtHeaderKeyName": "jwt"
});

module.exports = app;