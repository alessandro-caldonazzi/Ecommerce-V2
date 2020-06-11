const express = require('express');
const router = express.Router();
const db = require("./db/dbSocket");

router.get('/', function(req, res, next) {
    res.send("home");
});

module.exports = router;