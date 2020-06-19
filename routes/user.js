var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('./utils/jwt');
const db = require('./db/dbUtils');
const userUtils = require('./utils/userUtils');
const bcrypt = require('bcrypt');


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
            if (secretQuestion && secretAnswer) {
                await userUtils.alterUserData(decoded.email, { name, secretQuestion, secretAnswer }, res, next);
            } else {
                await userUtils.alterUserData(decoded.email, { name }, res, next);
            }
            res.send({ 'success': true }).json();
        } else {
            res.send({ 'success': false, 'error': { 'type': 'mysql' } }).json();
            return;
        }
    } catch (error) {
        res.status(403).json();
    }
});

router.post('/changepassword', [
    check('oldPassword').notEmpty().isLength({ min: 12, max: 30 }),
    check('newPassword').notEmpty().isLength({ min: 12, max: 30 })
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const hashNewPassword = await bcrypt.hash(newPassword, 10);
        const jwt = req.jwt;

        if (oldPassword == newPassword) {
            res.send({ 'success': false, 'error': { 'type': 'samePassword' } }).json();
            return;
        }

        let user = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [jwt.email], res, next);

        if (user.length > 0) {
            let isPasswordCorrect;
            isPasswordCorrect = await bcrypt.compare(oldPassword, user[0].password).catch(err => { isPasswordCorrect = false });
            if (!isPasswordCorrect) {
                res.send({ 'success': false, 'error': { 'type': 'incorrectOldPassword' } }).json();
                return;
            } else {
                if (user[0].temporaryPassword) {
                    await db.query('UPDATE users SET password = ?, temporarypassword = 0 WHERE email = ?', [hashNewPassword, jwt.email], res, next);
                } else {
                    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashNewPassword, jwt.email], res, next);
                }
                res.send({ 'success': true }).json();
            }
        } else {
            res.send({ 'success': false, 'error': { 'type': 'userNotExist' } }).json();
            return;
        }
    } catch (error) {
        res.status(403).json();
    }
});

router.post('/changemail', [
    check('newEmail').isEmail(),
    check('password').notEmpty().isLength({ min: 12, max: 30 })
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const newEmail = req.body.newEmail;
        const password = req.body.password;
        const jwt = req.jwt;

        let user = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [jwt.email], res, next);

        if (user.length > 0) {
            let isPasswordCorrect;
            isPasswordCorrect = await bcrypt.compare(password, user[0].password).catch(err => { isPasswordCorrect = false });
            if (!isPasswordCorrect) {
                res.send({ 'success': false, 'error': { 'type': 'incorrectPassword' } }).json();
                return;
            } else {
                await db.query('UPDATE users SET email = ? WHERE email = ?', [newEmail, jwt.email], res, next);

                res.send({ 'success': true }).json();
            }
        } else {
            res.send({ 'success': false, 'error': { 'type': 'userNotExist' } }).json();
            return;
        }
    } catch (error) {
        res.status(403).json();
    }
});

router.post('/addphone', [
    check('phone').isNumeric().isLength({ min: 10, max: 10 })
], async(req, res, next) => {
    try {
        validationResult(req).throw;
        const phone = req.body.phone;
        const jwt = req.jwt;

        await db.query('UPDATE users SET phoneNumber = ? WHERE email = ?', [phone, jwt.email], res, next);
        res.send({ 'success': true }).json();
    } catch (error) {
        res.status(403).json();
    }
});

module.exports = router;