const mysql = require('mysql');
const dbConfig = require("./dbConfig");
const dbconnection = mysql.createPool(
    dbConfig.dbConnectionInfo
);

dbconnection.on('connection', function(connection) {
    console.log('DB: Connessione stabilita');

    connection.on('error', function(err) {
        console.error(new Date(), 'MySQL error', err.code);
    });
    connection.on('close', function(err) {
        console.error(new Date(), 'MySQL close', err);
    });
});


module.exports = dbconnection;