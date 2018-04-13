const db = require('../lib/db.js')
const _ = require('lodash')
const drivers = require('../drivers')

// TODO this file being named connections makes it awkward to use
// because you'll want to do the following:
// connections.findAll().then(connections => )
// Instead models should be db folder, and db.<itemname>.findAll() should do what it needs
// db.js in lib can become to _db or something

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
