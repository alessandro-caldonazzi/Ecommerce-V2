const mailer = require('../email/mailer').mailer;

module.exports = (email, subject, text, res, next) => {
    let mail = {
        from: 'jtestnode@gmail.com',
        to: email,
        subject: subject,
        text: text
    }
    mailer.sendMail(mail, (err, info) => {
        if (err) {
            res.send({ 'success': false, 'error': { 'type': 'mail', err } }).json();
            next();
        }
    });
}