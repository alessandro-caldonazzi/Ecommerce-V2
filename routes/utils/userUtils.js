const dbUtils = require('../db/dbUtils');
const bcrypt = require('bcrypt');

module.exports.alterUserData = (email, objValue, res, next) => {
    return new Promise(async(resolve) => {
        const keys = Object.keys(objValue);
        let values = Object.values(objValue);
        values.push(email);

        let query = `UPDATE users SET ${ keys.join('=?,') + '=?' } WHERE email = ?`;
        let a = await dbUtils.query(query, values, res, next);
        resolve(a);
    });
}

module.exports.checkPassword = (email, password, res, next) => {
    return new Promise(async(resolve) => {
        let user = await dbUtils.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email], res, next);
        if (user.length > 0) {
            let isPasswordCorrect;
            isPasswordCorrect = await bcrypt.compare(password, user[0].password).catch(err => { isPasswordCorrect = false });
            if (!isPasswordCorrect) {
                res.send({ 'success': false, 'error': { 'type': 'incorrectPassword' } }).json();
                next();
            } else {
                resolve(user[0]);
            }
        } else {
            res.send({ 'success': false, 'error': { 'type': 'userNotExist' } }).json();
            next();
        }
    });
}