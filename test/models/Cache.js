var expect = require('chai').expect;
var should = require('chai').should();
var Cache = require('../../models/Cache.js')

describe.skip('models/Cache.js', function () {

    
    before(function before (done) {
        Cache.removeAll(done);
    });
    
    describe('new Cache', function () {
        it('should save without error', function (done) {
            done();
        })
    })

    describe('.findOneByCacheKey', function () {
        it('should get the cache item requested', function (done) {
            done();
        })
    })

    describe('.findExpired()', function () {
        it('should find expired cache items', function (done) {
            done();
        })
    })

    describe('.removeExpired()', function () {
        it('should remove expired items', function (done) {
            done();
        })
    })

    /*
    should.not.exist(err);
    connections.should.have.lengthOf(0);
    should.not.exist(err);
    expect(newConnection).to.be.an.instanceof(Connection);
    should.exist(newConnection._id);
    expect(connection._id).to.equal(testConnection._id);
    */
})