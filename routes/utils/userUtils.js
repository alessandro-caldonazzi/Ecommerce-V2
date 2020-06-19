const dbUtils = require('../db/dbUtils');

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