const dbUtils = require('../db/dbUtils');

/*module.exports.Order = */
class Order {
    constructor(userID, order, comment, status) {
        this.userID = userID;
        this.order = order;
        this.comment = comment;
        this.status = status;
    }

    async postToDb(res, next) {
        await dbUtils.query('INSERT INTO orders (userID, order, status, comment) VALUES (?, ?, ?, ?)', [this.userID, this.order, this.status, this.comment], res, next);
    }

    async getFromDb(ID) {
        let order = await dbUtils.query('SELECT `order`, status, comment, transactions.ID, transactions.type, transactions.userID FROM orders INNER JOIN transactions ON orders.transactionID = transactions.ID WHERE orders.ID = ?', [ID]);
        this.order = order.order;
        this.comment = order.comment;
        this.status = order.status;
        this.userID = order.userID;

        this.transaction = {
            'ID': order.ID,
            'type': order.type,
            'userID': order.userID
        }
    }
}

let a = new Order();
a.getFromDb(1)