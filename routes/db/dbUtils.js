const db = require("./dbSocket");

function query(query, param, res, next) {
    return new Promise(resolve => {
        db.query(query, param, (err, results) => {
            if (err) {
                console.log(err)
                res.send({ 'success': false, 'error': { 'type': 'mysql' } }).json();
                next();
            } else {
                resolve(results);
            }
        });
    });
}

module.exports.query = query;