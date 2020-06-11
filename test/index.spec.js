const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../bin/www');
const db = require("../routes/db/dbSocket");

chai.use(chaiHttp);
chai.should();

//clean table user
db.query('DELETE FROM users', function(error, results, fields) {});

describe('registrazione', () => {
    it('registro utente valido', (done) => {
        chai.request(server)
            .post('/auth/register')
            .send({ 'email': 'email@example.com' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
            });
    });

    it('registro utente con mail uguale', (done) => {
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

    it('registro utente con mail sintatticamente invalida', (done) => {
        chai.request(server)
            .post('/auth/register')
            .send({ 'email': '..@examp:le.com' })
            .end((err, res) => {
                res.should.have.status(403);
                done();
            });
    });
});