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
        await dbUtils.query('INSERT INTO transactions (type, userID) VALUES (?, ?)', [1, this.userID], res, next);
        let transactionID = await dbUtils.query('SELECT LAST_INSERT_ID()');
        await dbUtils.query('INSERT INTO orders (userID, `order`, status, comment, transactionID) VALUES (?, ?, ?, ?, ?)', [this.userID, this.order, this.status, this.comment, transactionID[0]['LAST_INSERT_ID()']], res, next);
    }

    async getFromDb(ID, res, next) {
        let order = await dbUtils.query('SELECT `order`, status, comment, transactions.ID, transactions.type, transactions.userID FROM orders INNER JOIN transactions ON orders.transactionID = transactions.ID WHERE orders.ID = ?', [ID], res, next);
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

    async changeStatus(status, res, next) {
        this.status = status;
        await db.query('UPDATE orders SET status = ? WHERE ID = ?', [status, this.ID], res, next);
    }
}

let a = new Order(3, "aa", "aaa", 1);
a.postToDb()