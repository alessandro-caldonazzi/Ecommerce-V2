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
        let userComment = req.body.comment;

        if (!(userComment && (typeof userComment == 'string') && userComment.length > 0 && userComment.length < 255)) {
            userComment = null;
        }

        let order = new Order(jwt.ID, userOrder, userComment, 1);
        await order.postToDb(res, next);
        res.send({ 'success': true, 'data': { 'ID': order._ID, 'order': userOrder, 'comment': userComment, 'status': 1 } });
    } catch (err) {
        res.status(403).json();
    }
});

router.post('/changestatus', [
    check('ID').notEmpty().isLength({ min: 1, max: 10 }),
    check('status').notEmpty().matches('[0-9]').isLength({ min: 1, max: 1 })
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const jwt = req.jwt;
        const ID = Number.parseInt(req.body.ID);
        const status = Number.parseInt(req.body.status);

        if (jwt.rank < 1) throw 'Invalid Permission';
        if (Number.isNaN(ID) || Number.isNaN(status)) throw 'Invalid ID or status';

        let order = new Order();
        await order.getFromDb(ID, res, next);
        await order.changeStatus(status);

        res.send({ 'success': true });
    } catch (err) {
        console.log(err)
        res.status(403).json();
    }
});

module.exports = router;