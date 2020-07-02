const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Order = require('./utils/orderUtils');
const stripe = require('stripe')(process.env.sk);
let sessionJson = require('./mock/stripeSession.json');

router.post('/new', [
    check('orderID').notEmpty().isLength({ min: 1, max: 10 }),
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const jwt = req.jwt;
        const orderID = req.body.orderID;

        let order = new Order();
        await order.getFromDb(orderID, res, next);

        if (!order.isOrderOfUser(jwt.email, res, next)) throw 'This is not your order!';
        if (!order._price) throw 'There is not price';

        sessionJson['line_items'][0]['price_data']['unit_amount'] = order._price * 100;
        sessionJson['line_items'][0]['price_data']['product_data']['name'] = 'Order N. ' + order._ID;

        const session = await stripe.checkout.sessions.create(sessionJson);
        res.json({ session_id: session.id });

    } catch (err) {
        console.log(err)
        res.status(403).json();
    }
});

module.exports = router;