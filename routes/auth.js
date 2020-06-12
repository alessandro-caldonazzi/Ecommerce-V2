const express = require('express');
const router = express.Router();
const db = require("./db/dbSocket");
const { check, validationResult } = require('express-validator');
const generator = require('generate-password');
const utils = require('./utils/utils');
const mailer = require('./email/mailer');
const useMail = require('../config/conf').useMail;
const bcrypt = require('bcrypt');
const session = require('session-jwt');

router.post('/login', [
    check('email').isEmail(),
    check('password').notEmpty().isLength({ min: 12, max: 30 })
], (req, res, next) => {
    try {
        validationResult(req).throw();
        const email = req.body.email;
        const password = req.body.password;
        db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email], (error, results, fields) => {
            if (error) {
                res.send({ 'success': false, 'error': { 'type': 'mysql', error } }).json();
                return;
            } else {
                if (results.length > 0) {
                    bcrypt.compare(password, results[0].password, (err, result) => {
                        if (err || !result) {
                            res.send({ 'success': false, 'error': { 'type': 'userNotExist' } }).json();
                            return;
                        } else {
                            session.newSession({
                                'ID': results[0].rank,
                                'refferalID': results[0].refferalID,
                                'name': results[0].name
                            }, (jwtToken, refreshToken) => {
                                res.cookie("refresh", refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true });
                                res.send({ 'success': true, 'data': { jwtToken } }).json();
                            });
                        }
                    });
                } else {
                    res.send({ 'success': false, 'error': { 'type': 'userNotExist' } }).json();
                    return;
                }
            }
        });
    } catch (error) {
        res.status(403).json();
    }
});

router.post('/register', [
    check('email').isEmail()
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const email = req.body.email;
        const password = generator.generate({
            length: 15,
            numbers: true,
            symbols: true
        });
        const hashPassword = await bcrypt.hash(password, 10);
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
                    VALUES (?, ?, ?, ?, ?, ?)', [0, email, hashPassword, registrationDate, ip, registrationDate], (err, result, fields) => {
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

router.post('/refresh', [
    check('jwt').notEmpty().trim().escape()
], async(req, res, next) => {
    try {
        let jwt = await session.refresh(req);
        if (jwt) {
            res.send({ 'success': true, 'data': { jwt } }).json();
        } else {
            res.redirect(301, "/auth/login");
            res.end();
        }
    } catch (error) {
        res.status(403).json();
    }
});

module.exports = router;