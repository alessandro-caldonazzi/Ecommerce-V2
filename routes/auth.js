const express = require('express');
const router = express.Router();
const db = require("./db/dbSocket");
const { check, validationResult } = require('express-validator');

router.get('/login', function(req, res, next) {
    db.query('SELECT 1 + 1 AS solution', function(error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results[0].solution);
    });
});

router.get('/register', [
    check('email').isEmail()
], (req, res, next) => {
    try {
        validationResult(req).throw();
        const email = req.body.email;
        res.send(email);
    } catch (err) {
        res.status(403).json();
    }
});

module.exports = router;