const db = require('../lib/db.js');
const _ = require('lodash');
const drivers = require('../drivers');
const cipher = require('../lib/cipher.js');
const decipher = require('../lib/decipher');

// TODO this file being named connections makes it awkward to use
// because you'll want to do the following:
// connections.findAll().then(connections => )
// Instead models should be db folder, and db.<itemname>.findAll() should do what it needs
// db.js in lib can become to _db or something

function decipherConnection(connection) {
  if (connection.username) {
    connection.username = decipher(connection.username);
  }
  if (connection.password) {
    connection.password = decipher(connection.password);
  }
  return connection;
}

const findAll = () =>
  db.connections
    .find({})
    .then(connections => _.sortBy(connections, c => c.name.toLowerCase()))
    .then(connections => connections.map(decipherConnection));

const findOneById = id =>
  db.connections
    .findOne({ _id: id })
    .then(connection => decipherConnection(connection));

const removeOneById = id => db.connections.remove({ _id: id });

const save = connection => {
  if (!connection) {
    return Promise.reject('connections.save() requires a connection');
  }

  connection.username = cipher(connection.username || '');
  connection.password = cipher(connection.password || '');

  return Promise.resolve().then(() => {
    if (!connection.createdDate) {
      connection.createdDate = new Date();
    }
    connection.modifiedDate = new Date();

    connection = drivers.validateConnection(connection);
    const { _id } = connection;

    if (_id) {
      return db.connections
        .update({ _id }, connection, {})
        .then(() => findOneById(_id));
    }
    return db.connections
      .insert(connection)
      .then(newDoc => findOneById(newDoc._id));
  });
};

module.exports = {
  findAll,
  findOneById,
  removeOneById,
  save
};
