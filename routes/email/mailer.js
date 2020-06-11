const nodemailer = require('nodemailer');
const emailPasswd = require('./mailConfig');

const mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jtestnode@gmail.com',
        pass: emailPasswd.emailPasswd
    }
});

module.exports.mailer = mailer;