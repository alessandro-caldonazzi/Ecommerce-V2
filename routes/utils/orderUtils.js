const dbUtils = require('../db/dbUtils');

class Order {
    constructor(userID, order, comment, status) {
        this.userID = userID;
        this.order = order;
        this.comment = comment;
        this.status = status;
    }
}

function postOrderToDb(order, res, next) {
    dbUtils.query('INSERT INTO orders (userID, order, status, comment) VALUES (?, ?, ?, ?)', [order.userID, order.order, order.status, order.comment], res, next);
}