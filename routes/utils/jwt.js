const jwt = require('jsonwebtoken');

module.exports.verify = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(decoded);
            }
        });
    });
}