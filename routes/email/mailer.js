const nodemailer = require('nodemailer');
const emailPasswd = require('./mailConfig');

const mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jstestnode@gmail.com',
        pass: emailPasswd
    }
});

module.exports.mailer = mailer;