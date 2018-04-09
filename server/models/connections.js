const db = require('../lib/db.js')
const _ = require('lodash')
const drivers = require('../drivers')

const findAll = () =>
  db.connections.find({}).then(connections => {
    return _.sortBy(connections, c => c.name.toLowerCase())
  })

const findOneById = id => db.connections.findOne({ _id: id })

const removeOneById = id => db.connections.remove({ _id: id })

const save = connection => {
  if (!connection) {
    return Promise.reject('connections.save() requires a connection')
  }
  return Promise.resolve().then(() => {
    if (!connection.createdDate) {
      connection.createdDate = new Date()
    }
    connection.modifiedDate = new Date()

    connection = drivers.validateConnection(connection)
    const { _id } = connection

    if (_id) {
      return db.connections
        .update({ _id }, connection, {})
        .then(() => findOneById(_id))
    }
    return db.connections.insert(connection)
  })
}

module.exports = {
  findAll,
  findOneById,
  removeOneById,
  save
}
