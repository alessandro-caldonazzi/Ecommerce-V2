const express = require('express');
const router = express.Router();
const db = require("./db/dbSocket");

router.get('/', function(req, res, next) {
    db.query('SELECT 1 + 1 AS solution', function(error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results[0].solution);
    });
});

module.exports = router;