const nodemailer = require('nodemailer');
let emailPasswd, mailer = null;
try {
    emailPasswd = require('./mailConfig');
} catch (error) {
    emailPasswd = null;
}

if (emailPasswd) {
    mailer = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'jtestnode@gmail.com',
            pass: emailPasswd.emailPasswd
        }
    });

}

module.exports.mailer = mailer;