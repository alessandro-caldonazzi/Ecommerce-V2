const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('session-jwt');
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const orderRouter = require('./routes/order');
const helmet = require("helmet");

// deepcode ignore UseCsurfForExpress: <please specify a reason of ignoring this>
const app = express();

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session.middleware);
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/order', orderRouter);

session.settings("segreto", ["/dashboard", '/user/changepassword', '/user/changemail', '/user/addphone', '/user/deleteaccount', '/user/info', '/order/new', '/order/changestatus'], "/auth/login", {
    "refreshUrl": "/auth/refresh",
    "blacklisting": true,
    "JwtHeaderKeyName": "jwt"
});

module.exports = app;