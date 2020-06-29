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
        await dbUtils.query('INSERT INTO orders (userID, `order`, status, comment) VALUES (?, ?, ?, ?)', [this.userID, this.order, this.status, this.comment], res, next);
    }

    async getFromDb(ID, res, next) {
        let order = await dbUtils.query('SELECT `order`, status, comment, userID, transactionID FROM orders WHERE orders.ID = ?', [ID], res, next);
        order = order[0];
        this.order = order.order;
        this.comment = order.comment;
        this.status = order.status;
        this.userID = order.userID;

        if (order.transactionID) {
            order = await dbUtils.query('SELECT * FROM transactions WHERE ID = ?', [order.transactionID], res, next);
            order = order[0];
            this.transaction = {
                'ID': order.ID,
                'type': order.type,
                'userID': order.userID
            }
        }
    }

    async changeStatus(status, res, next) {
        this.status = status;
        await db.query('UPDATE orders SET status = ? WHERE ID = ?', [status, this.ID], res, next);
    }

    async connectTransaction(transactionID, res, next) {
        await db.query('UPDATE orders SET transactionID = ? WHERE ID = ?', [transactionID, this.ID], res, next)
    }
}

let a = new Order();
a.getFromDb(4)