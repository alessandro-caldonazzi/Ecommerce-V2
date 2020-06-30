const dbUtils = require('../db/dbUtils');

module.exports = class Order {
    constructor(userID, order, comment, status) {
        this._userID = userID;
        this._order = order;
        this._comment = comment;
        this._status = status;
    }

    async postToDb(res, next) {
        let ID = await dbUtils.query('INSERT INTO orders (userID, `order`, status, comment) VALUES (?, ?, ?, ?)', [this._userID, this._order, this._status, this._comment], res, next);
        this._ID = ID.insertId;
    }

    async getFromDb(ID, res, next) {
        let order = await dbUtils.query('SELECT `order`, status, comment, userID, transactionID, ID, price FROM orders WHERE orders.ID = ?', [ID], res, next);
        if (order.length > 0) {
            order = order[0];
            this._order = order.order;
            this._comment = order.comment;
            this._status = order.status;
            this._userID = order.userID;
            this._ID = order.ID;
            this._price = order.price;

            if (order.transactionID) {
                order = await dbUtils.query('SELECT * FROM transactions WHERE ID = ?', [order.transactionID], res, next);
                order = order[0];
                this._transaction = {
                    'ID': order.ID,
                    'type': order.type,
                    'userID': order.userID,
                    'credits': order.credits,
                    'status': order.status
                }
            }
        } else {
            res.send({ 'success': false, 'error': { 'type': 'ID' } });
            next();
        }
    }

    async changeStatus(status, res, next) {
        this._status = status;
        await dbUtils.query('UPDATE orders SET status = ? WHERE ID = ?', [status, this._ID], res, next);
    }

    async connectTransaction(transactionID, res, next) {
        await dbUtils.query('UPDATE orders SET transactionID = ? WHERE ID = ?', [transactionID, this._ID], res, next)
    }

    async createTransaction(type, res, next, userID, credits, status) {
        let ID = await dbUtils.query('INSERT INTO transactions (type, userID, credits, status) VALUES (?, ?, ?, ?)', [type, userID, credit, status], res, next);
        this._transaction = {
            'ID': ID.insertId,
            'type': type,
            'userID': userID,
            'credits': credits,
            'status': status
        }
    }

    async addPrice(price, res, next) {
        await dbUtils.query('UPDATE orders SET price = ? WHERE ID = ?', [price, this._ID], res, next);
        if (this._transaction && this._transaction.ID) {
            await dbUtils.query('UPDATE transactions SET credits = ? WHERE ID = ?', [price, this._transaction.ID], res, next);
        }
    }

    static async listOrder(userID, res, next) {
        return await dbUtils.query('SELECT * FROM orders WHERE userID = ?', [userID], res, next);
    }

    get order() {
        return this._order;
    }

    get comment() {
        return this._comment;
    }

    get status() {
        return this._status;
    }

    get userID() {
        return this._userID;
    }

    get ID() {
        return this._ID;
    }

    get transaction() {
        return this._transaction;
    }

    get price() {
        return this._price;
    }

}