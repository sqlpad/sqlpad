/* eslint-env mocha */
var expect = require('chai').expect
var should = require('chai').should()
var Connection = require('../../models/Connection.js')

describe('models/Connection.js', function () {
  var testConnection

  before(function before (done) {
    Connection._removeAll(done)
  })

  describe('.findAll() with no connections', function () {
    it('should return an empty array', function (done) {
      Connection.findAll(function (err, connections) {
        should.not.exist(err)
        connections.should.have.lengthOf(0)
        done()
      })
    })
  })

  describe('new Connection', function () {
    it('should save without error', function (done) {
      testConnection = new Connection({
        driver: 'postgres',
        name: 'test connection',
        host: 'localhost',
        database: 'testdb',
        username: 'username',
        password: 'password'
      })
      testConnection.save(function (err, newConnection) {
        should.not.exist(err)
        expect(newConnection).to.be.an.instanceof(Connection)
        should.exist(newConnection._id)
        testConnection = newConnection
        done()
      })
    })
  })

  describe('.findOneById()', function () {
    it('should return requested connection', function (done) {
      Connection.findOneById(testConnection._id, function (err, connection) {
        should.not.exist(err)
        expect(connection).to.be.an.instanceof(Connection)
        expect(connection._id).to.equal(testConnection._id)
        done()
      })
    })
  })

  describe('.findAll()', function () {
    it('should return all connections', function (done) {
      Connection.findAll(function (err, connections) {
        should.not.exist(err)
        connections.should.have.lengthOf(1)
        expect(connections[0]).to.be.an.instanceof(Connection)
        done()
      })
    })
  })

  describe('.removeOneById()', function () {
    it('should remove the connection', function (done) {
      Connection.removeOneById(testConnection._id, function (err) {
        should.not.exist(err)
        Connection.findAll(function (err, connections) {
          should.not.exist(err)
          connections.should.have.lengthOf(0)
          done()
        })
      })
    })
  })
})
