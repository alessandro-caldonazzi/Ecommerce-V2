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
        let order = await dbUtils.query('SELECT `order`, status, comment, userID, transactionID, ID, price FROM orders WHERE orders.ID = ?', [ID], res, next);
        order = order[0];
        this.order = order.order;
        this.comment = order.comment;
        this.status = order.status;
        this.userID = order.userID;
        this.ID = order.ID;
        this.price = order.price;

        if (order.transactionID) {
            order = await dbUtils.query('SELECT * FROM transactions WHERE ID = ?', [order.transactionID], res, next);
            order = order[0];
            this.transaction = {
                'ID': order.ID,
                'type': order.type,
                'userID': order.userID,
                'credits': order.credits,
                'status': order.status
            }
        }
    }

    async changeStatus(status, res, next) {
        this.status = status;
        await dbUtils.query('UPDATE orders SET status = ? WHERE ID = ?', [status, this.ID], res, next);
    }

    async connectTransaction(transactionID, res, next) {
        await dbUtils.query('UPDATE orders SET transactionID = ? WHERE ID = ?', [transactionID, this.ID], res, next)
    }

    async createTransaction(type, res, next, userID, credit, status) {
        await dbUtils.query('INSERT INTO transactions (type, userID, credit, status) VALUES (?, ?, ?, ?)', [type, userID, credit, status], res, next);
    }

    async addPrice(price, res, next) {
        await dbUtils.query('UPDATE orders SET price = ? WHERE ID = ?', [price, this.ID], res, next);
    }
}

(async() => {
    let a = new Order(1, "aa", "comment", 1);
    await a.getFromDb(1)
    await a.createTransaction(1, null, null, 1)
    await a.connectTransaction(1)
    await a.getFromDb(1)
})();