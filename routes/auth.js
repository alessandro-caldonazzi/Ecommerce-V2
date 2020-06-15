const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const generator = require('generate-password');
const utils = require('./utils/utils');
const mailer = require('./email/mailer');
const inProduction = require('../config/conf').inProduction;
const bcrypt = require('bcrypt');
const session = require('session-jwt');
const dbUtils = require('./db/dbUtils')

router.post('/login', [
    check('email').isEmail(),
    check('password').notEmpty().isLength({ min: 12, max: 30 })
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const email = req.body.email;
        const password = req.body.password;
        let user = await dbUtils.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email], res, next);

        if (user.length > 0) {
            bcrypt.compare(password, user[0].password, (err, result) => {
                if (err || !result) {
                    res.send({ 'success': false, 'error': { 'type': 'userNotExist' } }).json();
                    return;
                } else {
                    session.newSession({
                        'ID': user[0].rank,
                        'referalID': user[0].referalID,
                        'name': user[0].name,
                        'email': email
                    }, (jwtToken, refreshToken) => {
                        res.cookie("refresh", refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true });
                        if (user[0].name && !user[0].temporaryPassword) {
                            res.send({ 'success': true, 'data': { jwtToken } }).json();
                        } else {
                            res.send({ 'success': true, 'data': { jwtToken, 'temporaryPassword': user[0].temporaryPassword, 'name': user[0].name } }).json();
                        }
                    });
                }
            });
        } else {
            res.send({ 'success': false, 'error': { 'type': 'userNotExist' } }).json();
            return;
        }
    } catch (error) {
        res.status(403).json();
    }
});

router.post('/register', [
    check('email').isEmail(),
    check('terms').isBoolean()
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        if (!req.body.terms) {
            res.send({ 'success': false, 'error': { 'type': 'terms' } }).json();
            return;
        }
        const email = req.body.email;
        const password = generator.generate({
            length: 15,
            numbers: true,
            symbols: true
        });
        const hashPassword = await bcrypt.hash(password, 10);
        const registrationDate = utils.getDate();
        const ip = utils.getIp(req);
        const referalID = req.body.refferalID;

        let alreadyExist = await dbUtils.query('SELECT COUNT(1) FROM users WHERE email = ?', [email], res, next);
        alreadyExist = alreadyExist[0]['COUNT(1)'];

        if (alreadyExist) {
            res.send({ 'success': false, 'error': { 'type': 'mailAlreadyExist' } }).json();
            return;
        }

        let query = 'INSERT INTO users \
                    (rank, email, password, registrationDate, registrationIp, lastLoginDate) \
                    VALUES (?, ?, ?, ?, ?, ?)';
        let values = [0, email, hashPassword, registrationDate, ip, registrationDate];

        if (Number.isInteger(referalID)) {
            query = 'INSERT INTO users \
                        (rank, email, password, registrationDate, registrationIp, lastLoginDate, referalID) \
                        VALUES (?, ?, ?, ?, ?, ?, ?)';

            values.push(referalID);
        }
        await dbUtils.query(query, values, res, next);
        let mail = {
            from: 'jtestnode@gmail.com',
            to: email,
            subject: 'Benvenuto in SteamParadise - Credenziali',
            text: `Password: ${password}`
        }
        if (inProduction) {
            mailer.mailer.sendMail(mail, (err, info) => {
                if (err) {
                    res.send({ 'success': false, 'error': { 'type': 'mail', err } }).json();
                    return;
                } else {
                    res.send({ 'success': true }).json();
                }
            });
        } else {
            res.send({ 'success': true, 'data': { password } }).json();
        }
    } catch (err) {
        res.status(403).json();
    }
});

router.post('/refresh', async(req, res, next) => {
    let jwtToken = await session.refresh(req);
    if (jwtToken) {
        res.send({ 'success': true, 'data': { jwtToken } }).json();
    } else {
        res.redirect(301, "/auth/login");
        res.end();
    }
});

module.exports = router;