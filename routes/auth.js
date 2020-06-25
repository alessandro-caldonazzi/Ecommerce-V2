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
const userUtils = require('./utils/userUtils');

router.post('/login', [
    check('email').isEmail(),
    check('password').notEmpty().isLength({ min: 12, max: 30 })
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const email = req.sanitize(req.body.email);
        const password = req.sanitize(req.body.password);
        const loginDate = utils.getDate();
        const ip = utils.getIp(req);

        let user = await userUtils.checkPassword(email, password, res, next);
        let { jwtToken, refreshToken } = await session.newSession({
            'ID': user.rank,
            'referalID': user.referalID,
            'name': user.name,
            'email': email
        });

        userUtils.alterUserData(email, { 'lastLoginIp': ip, 'lastLoginDate': loginDate });

        // deepcode ignore WebCookieSecureDisabledByDefault: <please specify a reason of ignoring this>, deepcode ignore WebCookieSecureDisabledByDefault: <please specify a reason of ignoring this>, deepcode ignore WebCookieHttpOnlyDisabledByDefault: <please specify a reason of ignoring this>
        res.cookie("refresh", refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: false });
        if (user.name && !user.temporaryPassword) {
            res.send({ 'success': true, 'data': { jwtToken } }).json();
        } else {
            res.send({ 'success': true, 'data': { jwtToken, 'temporaryPassword': user.temporaryPassword, 'name': user.name } }).json();
        }
    } catch (error) {
        console.log(error)
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
        const email = req.sanitize(req.body.email);
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
                    res.send({ 'success': false, 'error': { 'type': 'mail' } }).json();
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

router.post('/forgot', [
    check('email').isEmail()
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const email = req.sanitize(req.body.email);
        const password = generator.generate({
            length: 15,
            numbers: true,
            symbols: true
        });
        const hashPassword = await bcrypt.hash(password, 10);

        let mail = {
            from: 'jtestnode@gmail.com',
            to: email,
            subject: 'Ecco le tue nuove credenziali',
            text: `Password: ${password}`
        }

        userUtils.alterUserData(email, { 'password': hashPassword, 'temporaryPassword': 1 }, res, next);

        if (inProduction) {
            mailer.mailer.sendMail(mail, (err, info) => {
                if (err) {
                    res.send({ 'success': false, 'error': { 'type': 'mail' } }).json();
                    return;
                } else {
                    res.send({ 'success': true }).json();
                }
            });
        } else {
            res.send({ 'success': true, 'data': { password } }).json();
        }


    } catch (error) {
        console.log(error)
        res.status(403).json();
    }
});

module.exports = router;