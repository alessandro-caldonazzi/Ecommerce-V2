const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Order = require('./utils/orderUtils');

router.post('/new', [
    check('order').notEmpty().isString().trim().escape()
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const jwt = req.jwt;
        const userOrder = req.body.order;
        const userComment = req.body.comment;

        if (!(userComment && (typeof userComment == 'string') && userComment.length > 0 && userComment.length < 255)) {
            userComment = null;
        }

        let order = new Order(jwt.ID, userOrder, userComment, 1);

    } catch (err) {
        console.log(err);
        res.status(403).json();
    }
});

module.exports = router;