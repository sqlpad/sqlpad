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

async function findAll() {
  const connections = await db.connections.find({});
  return _.sortBy(connections, c => c.name.toLowerCase()).map(
    decipherConnection
  );
}

async function findOneById(id) {
  const connection = await db.connections.findOne({ _id: id });
  return decipherConnection(connection);
}

async function removeOneById(id) {
  return db.connections.remove({ _id: id });
}

async function save(connection) {
  if (!connection) {
    throw new Error('connections.save() requires a connection');
  }

  connection.username = cipher(connection.username || '');
  connection.password = cipher(connection.password || '');

  if (!connection.createdDate) {
    connection.createdDate = new Date();
  }
  connection.modifiedDate = new Date();

  connection = drivers.validateConnection(connection);
  const { _id } = connection;

  if (_id) {
    await db.connections.update({ _id }, connection, {});
    return findOneById(_id);
  }
  const newDoc = await db.connections.insert(connection);
  return findOneById(newDoc._id);
}

module.exports = {
  findAll,
  findOneById,
  removeOneById,
  save
};
