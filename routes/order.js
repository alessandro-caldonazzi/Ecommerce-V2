const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Order = require('./utils/orderUtils');

router.post('/new', [
    check('order').notEmpty().isString().trim()
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const jwt = req.jwt;
        const userOrder = req.body.order;
        let userComment = req.body.comment;
        let commentArray = [];

        if (!(userComment && (typeof userComment == 'string') && userComment.length > 0 && userComment.length < 255)) {
            commentArray.push(null);
        } else {
            commentArray.push(userComment);
        }

        let order = new Order(jwt.ID, userOrder, commentArray.toString(), 1);
        await order.postToDb(res, next);
        res.send({ 'success': true, 'data': { 'ID': order._ID, 'order': userOrder, 'comment': commentArray, 'status': 1 } });
    } catch (err) {
        console.log(err)
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
        await order.changeStatus(status, res, next);
        res.send({ 'success': true });

    } catch (err) {
        res.status(403).json();
    }
});

router.post('/addprice', [
    check('userID').notEmpty().isLength({ min: 1, max: 10 }),
    check('orderID').notEmpty().isLength({ min: 1, max: 10 }),
    check('price').notEmpty().matches('[0-9,.]+').isLength({ min: 1, max: 6 })
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const jwt = req.jwt;
        const ID = Number.parseInt(req.body.orderID);
        const userID = Number.parseInt(req.body.userID);
        const price = Number.parseFloat(req.body.price);

        if (jwt.rank < 1) throw 'Invalid Permission';
        if (Number.isNaN(ID) || Number.isNaN(userID) || Number.isNaN(price)) throw 'Invalid ID or price';

        let order = new Order();
        await order.getFromDb(ID, res, next);
        await order.addPrice(price, res, next);
        await order.createTransaction(1, res, next, userID, price, 1);
        await order.connectTransaction(res, next)
        res.send({ 'success': true });

    } catch (err) {
        console.log(err)
        res.status(403).json();
    }
});

router.post('/list', async(req, res, next) => {
    try {
        const jwt = req.jwt;

        let orders = await Order.listOrder(jwt.ID, res, next);
        res.send({ 'success': true, 'data': orders });

    } catch (err) {
        res.status(403).json();
    }
});

router.post('/listfromemail', [
    check('email').isEmail(),
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const jwt = req.jwt;
        const email = req.body.email;

        if (jwt.rank < 1) throw 'Invalid Permission';

        let orders = await Order.listOrderFromEmail(email, res, next);
        res.send({ 'success': true, 'data': orders });

    } catch (err) {
        res.status(403).json();
    }
});

router.post('/delete', [
    check('ID').notEmpty().isLength({ min: 1, max: 10 }),
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const jwt = req.jwt;
        const ID = Number.parseInt(req.body.ID);

        await Order.deleteOrder(jwt.email, ID, res, next);
        res.send({ 'success': true });

    } catch (err) {
        res.status(403).json();
    }
});

module.exports = router;