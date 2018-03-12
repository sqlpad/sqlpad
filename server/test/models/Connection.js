const assert = require('assert')
const Connection = require('../../models/Connection.js')

describe('models/Connection.js', function() {
  let testConnection

  before(function() {
    return Connection._removeAll()
  })

  describe('.findAll() with no connections', function() {
    it('should return an empty array', function() {
      return Connection.findAll().then(connections => {
        assert.equal(connections.length, 0, 'length = 0')
      })
    })
  })

  describe('new Connection', function() {
    it('should save without error', function() {
      testConnection = new Connection({
        driver: 'postgres',
        name: 'test connection',
        host: 'localhost',
        database: 'testdb',
        username: 'username',
        password: 'password'
      })
      return testConnection.save().then(newConnection => {
        assert(newConnection instanceof Connection, 'should be Connection')
        assert(newConnection._id, '_id should exist')
        testConnection = newConnection
      })
    })
  })

  describe('.findOneById()', function() {
    it('should return requested connection', function() {
      return Connection.findOneById(testConnection._id).then(connection => {
        assert(
          connection instanceof Connection,
          'Expect instance of Connection'
        )
        assert.equal(connection._id, testConnection._id, '_ids should match')
      })
    })
  })

  describe('.findAll()', function() {
    it('should return all connections', function() {
      return Connection.findAll().then(connections => {
        assert(connections.length === 1, 'connections should have length of 1')
        assert(
          connections[0] instanceof Connection,
          'connection should be instance of Connection'
        )
      })
    })
  })

  describe('.removeOneById()', function() {
    it('should remove the connection', function() {
      return Connection.removeOneById(testConnection._id)
        .then(() => Connection.findAll())
        .then(connections => {
          assert.equal(
            connections.length,
            0,
            'connections should have lengthof 0'
          )
        })
    })
  })
})
