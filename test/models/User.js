var expect = require('chai').expect;
var should = require('chai').should();
var User = require('../../models/User.js')

describe('models/User.js', function () {

    var regularUser = new User({email: 'regular@test.com'});
    var adminUser = new User({email: 'admin@test.com', admin: true});
    var signedUpUser = new User({email: 'signedUp@test.com', password: '1234'});

    before(function before (done) {
        User._removeAll(done)
    })

    describe('.openAdminRegistration()', function () {
        it('should return true if no admins exist', function (done) {
            User.adminRegistrationOpen(function (err, open) {
                should.not.exist(err);
                expect(open).to.equal(true);
                done();
            })
        })
        it('should return false if admin exist', function (done) {
            adminUser.save(function (err) {
                should.not.exist(err);
                User.adminRegistrationOpen(function (err, open) {
                    should.not.exist(err);
                    expect(open).to.equal(false);
                    done();
                })
            })
        })
    })

    describe('new User', function () {
        it('should save without error', function (done) {
            regularUser.save(function (err) {
                adminUser.save(function (err) {
                    signedUpUser.save(done);
                });
            })
        })
    })

    describe('.findAll()', function () {
        it('should return all the existing users', function (done) {
            // todo
            User.findAll(function (err, users) {
                should.not.exist(err);
                users.should.have.lengthOf(3);
                expect(users[0]).to.be.an.instanceof(User);
                done();
            });
        })
    })

    describe('.findOneByEmail()', function () {
        it('should return requested user', function (done) {
            User.findOneByEmail('admin@test.com', function (err, user) {
                should.not.exist(err);
                expect(user).to.be.an.instanceof(User);
                expect(user.email).to.equal('admin@test.com');
                expect(user.admin).to.equal(true);
                done();
            })
        })
    })

    describe('new User', function () {
        it('should save without error', function (done) {
            var user = new User({email: '2@test.com'});
            user.save(done);
        })
        it('should have defaults populated', function (done) {
            User.findOneByEmail('regular@test.com', function (err, user) {
                should.not.exist(err);
                should.exist(user);
                should.exist(user.email);
                expect(user.admin).to.equal(false);
                expect(user).to.be.an.instanceof(User);
                expect(user.createdDate).to.be.instanceof(Date);
                expect(user.modifiedDate).to.be.instanceof(Date);
                done();
            })
        })

    })

    describe('.comparePasswordToHash()', function () {
        it('should return true if password is a match', function (done) {
            User.findOneByEmail('signedUp@test.com', function (err, user) {
                user.comparePasswordToHash('1234', function (err, isMatch) {
                    should.not.exist(err);
                    expect(isMatch).to.equal(true);
                    done();
                });
            });
        })
        it('should return false if password is not a match', function (done) {
            User.findOneByEmail('signedUp@test.com', function (err, user) {
                user.comparePasswordToHash('wrongpassword', function (err, isMatch) {
                    should.not.exist(err);
                    expect(isMatch).to.equal(false);
                    done();
                });
            });
        })
    })

})