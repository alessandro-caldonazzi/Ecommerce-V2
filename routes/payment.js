const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Order = require('./utils/orderUtils');
const stripe = require('stripe')(process.env.sk);

router.post('/new', [
    check('orderID').notEmpty().isLength({ min: 1, max: 10 }),
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const jwt = req.jwt;
        const orderID = req.body.orderID;

        let order = new Order();
        await order.getFromDb(orderID, res, next);

        if (!order._price) throw 'There is not price';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'T-shirt',
                    },
                    unit_amount: 2000,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost/payment/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost/cancel',
        });
        res.json({ session_id: session.id });

    } catch (err) {
        console.log(err)
        res.status(403).json();
    }
});

module.exports = router;