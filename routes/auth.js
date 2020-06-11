const express = require('express');
const router = express.Router();
const db = require("./db/dbSocket");
const { check, validationResult } = require('express-validator');
const generator = require('generate-password');
const utils = require('./utils/utils');
const mailer = require('./email/mailer');
const useMail = require('../config/conf').useMail;

router.post('/login', function(req, res, next) {
    db.query('SELECT 1 + 1 AS solution', function(error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results[0].solution);
    });
});

router.post('/register', [
    check('email').isEmail()
], (req, res, next) => {
    try {
        validationResult(req).throw();
        const email = req.body.email;
        const password = generator.generate({
            length: 15,
            numbers: true,
            symbols: true
        })
        const registrationDate = utils.getDate();
        const ip = utils.getIp(req);
        db.query('SELECT COUNT(1) FROM users WHERE email = ?', [email], (error, results, fields) => {
            if (error) {
                res.send({ 'success': true, 'error': { 'type': 'mysql', error } }).json();
                return;
            } else {
                if (!results[0]['COUNT(1)']) {
                    db.query('INSERT INTO users \
                    (rank, email, password, registrationDate, registrationIp, lastLoginDate) \
                    VALUES (?, ?, ?, ?, ?, ?)', [0, email, password, registrationDate, ip, registrationDate], (err, result, fields) => {
                        if (err) {
                            res.send({ 'success': false, 'error': { 'type': 'mysql', err } }).json();
                            return;
                        } else {
                            let mail = {
                                from: 'jtestnode@gmail.com',
                                to: email,
                                subject: 'Benvenuto in SteamParadise - Credenziali',
                                text: `Password: ${password}`
                            }
                            if (useMail) {
                                mailer.mailer.sendMail(mail, (err, info) => {
                                    if (err) {
                                        res.send({ 'success': false, 'error': { 'type': 'mail', err } }).json();
                                        return;
                                    } else {
                                        res.send({ 'success': true }).json();
                                    }
                                });
                            } else {
                                res.send({ 'success': true }).json();
                            }

                        }
                    });
                } else {
                    res.send({ 'success': false, 'error': { 'type': 'mailAlreadyExist' } }).json();
                    return;
                }
            }
        });
    } catch (err) {
        res.status(403).json();
    }
});

module.exports = router;