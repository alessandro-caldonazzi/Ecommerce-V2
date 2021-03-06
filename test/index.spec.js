const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../bin/www');
const db = require("../routes/db/dbSocket");

chai.use(chaiHttp);
chai.should();
let should = chai.should();

//clean table user
db.query('DELETE FROM transaction', [], function(error, results, fields) {});
db.query('DELETE FROM orders', [], function(error, results, fields) {});
db.query('DELETE FROM users', [], function(error, results, fields) {});
db.query('ALTER TABLE users AUTO_INCREMENT = 1', function(error, results, fields) {});


describe('test', () => {
    let password, password2;
    let jwt, jwt2;
    let refresh;
    let IDorder, IDorder2, userID;
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
                password2 = res.body.data.password;
                done();
            });
    });

    step('aggiungo privilegi ad utente email1', async(done) => {
        await db.query('UPDATE users SET rank = 1 WHERE email = "email1@example.com"', [], function(error, results, fields) {});
        done();
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
                userID = res.body.data.userID;
                res.body.data.temporaryPassword.should.equal(1);
                should.equal(res.body.data.name, null);
                done();
            });
    });

    step('login con account rank 1', (done) => {
        chai.request(server)
            .post('/auth/login')
            .send({ 'email': 'email1@example.com', 'password': password2 })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                jwt2 = res.body.data.jwtToken;
                res.header['set-cookie'].should.have.length(1);
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
            .get("/auth/refresh")
            .set("Cookie", refresh)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                jwt = res.body.jwt;
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
                password = 'lamianuovapassword';
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

    step("Cambio email", (done) => {
        chai.request(server)
            .post("/user/changemail")
            .set("Cookie", refresh)
            .set('jwt', jwt)
            .send({ 'password': password, 'newEmail': 'nuovamail@example.com' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });

    step('login con nuova email', (done) => {
        chai.request(server)
            .post('/auth/login')
            .send({ 'email': 'nuovamail@example.com', 'password': password })
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

    step("Aggiungo numero di telefono", (done) => {
        chai.request(server)
            .post("/user/addphone")
            .set("Cookie", refresh)
            .set('jwt', jwt)
            .send({ 'phone': '1234567890' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });

    step("Aggiungo numero di telefono invalido", (done) => {
        chai.request(server)
            .post("/user/addphone")
            .set("Cookie", refresh)
            .set('jwt', jwt)
            .send({ 'phone': 'aa890' })
            .end((err, res) => {
                res.should.have.status(403);
                done();
            });
    });

    step("Forgot password", (done) => {
        chai.request(server)
            .post("/auth/forgot")
            .send({ 'email': 'email@example.com' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                password = res.body.data.password;
                done();
            });
    });

    step("get user info", (done) => {
        chai.request(server)
            .post("/user/info")
            .set('jwt', jwt)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });

    step("create order", (done) => {
        chai.request(server)
            .post("/order/new")
            .set('jwt', jwt)
            .send({ 'order': "['Gta V', 'R6']", 'comment': 'urgente' })
            .end((err, res) => {
                console.log(res.body)
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                IDorder = res.body.data.ID;
                done();
            });
    });

    step("create order senza comment", (done) => {
        chai.request(server)
            .post("/order/new")
            .set('jwt', jwt)
            .send({ 'order': "['Gta V']" })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                IDorder2 = res.body.data.ID;
                console.log(IDorder2);
                done();
            });
    });

    step("cambio stato ordine senza permessi", (done) => {
        chai.request(server)
            .post("/order/changestatus")
            .set('jwt', jwt)
            .send({ 'status': 2, 'ID': IDorder })
            .end((err, res) => {
                res.should.have.status(403);
                done();
            });
    });

    step("cambio stato ordine con permessi", (done) => {
        chai.request(server)
            .post("/order/changestatus")
            .set('jwt', jwt2)
            .send({ 'status': 2, 'ID': IDorder })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });

    step("aggiunta prezzo", (done) => {
        chai.request(server)
            .post("/order/addprice")
            .set('jwt', jwt2)
            .send({ 'price': 22.5, 'orderID': IDorder, 'userID': userID })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });

    step("lista ordini", (done) => {
        chai.request(server)
            .post("/order/list")
            .set('jwt', jwt)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });

    step("lista ordini da admin", (done) => {
        chai.request(server)
            .post("/order/listfromemail")
            .send({ 'email': 'nuovamail@example.com' })
            .set('jwt', jwt2)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });

    step(`elimino ordine`, (done) => {
        chai.request(server)
            .post("/order/delete")
            .send({ 'ID': IDorder2 })
            .set('jwt', jwt)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });
});