var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('./utils/jwt');
const utils = require('./utils/utils');
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
        const name = req.sanitize(req.body.name);
        const secretQuestion = req.sanitize(req.body.secretQuestion);
        const secretAnswer = req.sanitize(req.body.secretAnswer);
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
        const oldPassword = req.sanitize(req.body.oldPassword);
        const newPassword = req.sanitize(req.body.newPassword);
        const password = await bcrypt.hash(newPassword, 10);
        const jwt = req.jwt;

        if (oldPassword == newPassword) {
            res.send({ 'success': false, 'error': { 'type': 'samePassword' } }).json();
            return;
        }

        let user = await userUtils.checkPassword(jwt.email, oldPassword, res, next);

        if (user.temporaryPassword) {
            await userUtils.alterUserData(jwt.email, { password, 'temporarypassword': 0 }, res, next);
        } else {
            await userUtils.alterUserData(jwt.email, { password }, res, next);
        }
        res.send({ 'success': true }).json();

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
        const newEmail = req.sanitize(req.body.newEmail);
        const password = req.sanitize(req.body.password);
        const jwt = req.jwt;

        await userUtils.checkPassword(jwt.email, password, res, next);

        await userUtils.alterUserData(jwt.email, { 'email': newEmail }, res, next);
        res.send({ 'success': true }).json();

    } catch (error) {
        res.status(403).json();
    }
});

router.post('/addphone', [
    check('phone').isNumeric().isLength({ min: 10, max: 10 })
], async(req, res, next) => {
    try {
        validationResult(req).throw;
        const phoneNumber = req.sanitize(req.body.phone);
        const jwt = req.jwt;

        await userUtils.alterUserData(jwt.email, { phoneNumber }, res, next);
        res.send({ 'success': true }).json();
    } catch (error) {
        res.status(403).json();
    }
});

router.post('/deleteaccount', async(req, res, next) => {
    const jwt = req.jwt;
    await db.query('DELETE FROM users WHERE email = ?', [jwt.email], res, next);
    res.send({ 'success': true }).json();
});

router.post('/info', async(req, res, next) => {
    const jwt = req.jwt;
    let user = await userUtils.getInfo(jwt.email, res, next);
    utils.deleteProps(user, ['lastLoginIp', 'secretAnswer', 'secretQuestion', 'registrationIp', 'password', 'temporaryPassword']);
    res.send({ 'success': true, 'data': user }).json();
});

module.exports = router;