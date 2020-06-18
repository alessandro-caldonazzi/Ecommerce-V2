const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../bin/www');
const db = require("../routes/db/dbSocket");

chai.use(chaiHttp);
chai.should();
let should = chai.should();

//clean table user
db.query('DELETE FROM users', [], function(error, results, fields) {});
db.query('ALTER TABLE users AUTO_INCREMENT = 1', function(error, results, fields) {});


describe('test', () => {
    let password;
    let jwt;
    let refresh;
    step('registro utente valido', (done) => {
        chai.request(server)
            .post('/auth/register')
            .send({ 'email': 'email@example.com', 'terms': true })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                password = res.body.data.password;
                done();
            });
    });

    step('registro utente valido (ref del primo)', (done) => {
        chai.request(server)
            .post('/auth/register')
            .send({ 'email': 'email1@example.com', 'terms': true, 'refferalID': 1 })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });

    step('registro utente con mail uguale', (done) => {
        chai.request(server)
            .post('/auth/register')
            .send({ 'email': 'email@example.com', 'terms': true })
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
            .send({ 'email': '..@examp:le.com', 'terms': true })
            .end((err, res) => {
                res.should.have.status(403);
                done();
            });
    });

    step('registro utente senza termini validi', (done) => {
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
                res.body.data.temporaryPassword.should.equal(1);
                should.equal(res.body.data.name, null);
                done();
            });
    });

    step('aggiunta info utente', (done) => {
        chai.request(server)
            .post('/user/new')
            .set("Cookie", refresh)
            .send({ 'name': 'nomeValido' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });

    step('login dopo aver aggiunto i dati', (done) => {
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
                res.body.data.temporaryPassword.should.equal(1);
                res.body.data.name.should.equal('nomeValido');
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

    step("Cambio password", (done) => {
        chai.request(server)
            .post("/user/changepassword")
            .set("Cookie", refresh)
            .set('jwt', jwt)
            .send({ 'oldPassword': password, 'newPassword': 'lamianuovapassword' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                password = 'lamianuovapassword'
                console.log(res.body)
                done();
            });
    });

    step('login con nuova password', (done) => {
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
});