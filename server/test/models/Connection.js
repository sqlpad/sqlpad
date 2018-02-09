const assert = require('assert')
const Connection = require('../../models/Connection.js')

describe('models/Connection.js', function() {
  let testConnection

  before(function() {
    return Connection._removeAll()
  })

  describe('.findAll() with no connections', function() {
    it('should return an empty array', function(done) {
      Connection.findAll(function(err, connections) {
        assert.ifError(err)
        assert.equal(connections.length, 0, 'length = 0')
        done()
      })
    })
  })

  describe('new Connection', function() {
    it('should save without error', function(done) {
      testConnection = new Connection({
        driver: 'postgres',
        name: 'test connection',
        host: 'localhost',
        database: 'testdb',
        username: 'username',
        password: 'password'
      })
      testConnection.save(function(err, newConnection) {
        assert.ifError(err)
        assert(newConnection instanceof Connection, 'should be Connection')
        assert(newConnection._id, '_id should exist')
        testConnection = newConnection
        done()
      })
    })
  })

  describe('.findOneById()', function() {
    it('should return requested connection', function(done) {
      Connection.findOneById(testConnection._id, function(err, connection) {
        assert.ifError(err)
        assert(
          connection instanceof Connection,
          'Expect instance of Connection'
        )
        assert.equal(connection._id, testConnection._id, '_ids should match')
        done()
      })
    })
  })

  describe('.findAll()', function() {
    it('should return all connections', function(done) {
      Connection.findAll(function(err, connections) {
        assert.ifError(err)
        assert(connections.length === 1, 'connections should have length of 1')
        assert(
          connections[0] instanceof Connection,
          'connection should be instance of Connection'
        )
        done()
      })
    })
  })

  describe('.removeOneById()', function() {
    it('should remove the connection', function(done) {
      Connection.removeOneById(testConnection._id, function(err) {
        assert.ifError(err)
        Connection.findAll(function(err, connections) {
          assert.ifError(err)
          assert.equal(
            connections.length,
            0,
            'connections should have lengthof 0'
          )
          done()
        })
      })
    })
  })
})
