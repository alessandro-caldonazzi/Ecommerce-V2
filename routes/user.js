var express = require('express');
var router = express.Router();
const db = require("./db/dbSocket");
const { check, validationResult } = require('express-validator');
const jwt = require('./utils/jwt');
const dbUtils = require('./db/dbUtils');

/* GET users listing. */
router.post('/new', [
    check('name').notEmpty().isLength({ min: 3, max: 255 }).escape()
    /*,
        check('secretQuestion').notEmpty().isLength({ min: 3, max: 255 }).escape(),
        check('secretAnswer').notEmpty().isLength({ min: 1, max: 255 }).escape()*/
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const name = req.body.name;
        const secretQuestion = req.body.secretQuestion;
        const secretAnswer = req.body.secretAnswer;
        let decoded = await jwt.verify(req.cookies.refresh, 'segreto').catch(err => {});

        if (!decoded.name) {
            let query = 'UPDATE users SET name = ? WHERE email = ?';
            let values = [name, decoded.email];
            if (secretQuestion && secretAnswer) {
                query = 'UPDATE users SET name = ?, secretQuestion = ?, secretAnswer = ? WHERE email = ?';
                values = [name, secretQuestion, secretAnswer, decoded.email];
            }
            await dbUtils.query(query, values, res, next);
            res.send({ 'success': true }).json();
        } else {
            res.send({ 'success': false, 'error': { 'type': 'mysql' } }).json();
            return;
        }
    } catch (error) {
        res.status(403).json();
    }
});

module.exports = router;