const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../bin/www');
const db = require("../routes/db/dbSocket");

chai.use(chaiHttp);
chai.should();

//clean table user
db.query('DELETE FROM users', function(error, results, fields) {});

describe('registrazione', () => {
    let password;
    let refresh;
    step('registro utente valido', (done) => {
        chai.request(server)
            .post('/auth/register')
            .send({ 'email': 'email@example.com' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                password = res.body.data.password;
                done();
            });
    });

    step('registro utente con mail uguale', (done) => {
        chai.request(server)
            .post('/auth/register')
            .send({ 'email': 'email@example.com' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(false);
                res.body.error.type.should.equal('mailAlreadyExist');
                done();
            });
    });

    step('registro utente con mail sintatticamente invalida', (done) => {
        chai.request(server)
            .post('/auth/register')
            .send({ 'email': '..@examp:le.com' })
            .end((err, res) => {
                res.should.have.status(403);
                done();
            });
    });

    step('login con mail e password corretti', (done) => {
        chai.request(server)
            .post('/auth/login')
            .send({ 'email': 'email@example.com', 'password': password })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                jwt = res.body.data.jwtToken;
                res.header['set-cookie'].should.have.length(1);
                refresh = res.header['set-cookie'][0];
                done();
            });
    });

    step("Prova refresh senza jwt", (done) => {
        chai.request(server)
            .post("/auth/refresh")
            .set("Cookie", refresh)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                jwt = res.body.data.jwtToken;
                done();
            });
    });
});