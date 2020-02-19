const _ = require('lodash');
const drivers = require('../drivers');
const makeCipher = require('../lib/makeCipher');
const config = require('../lib/config');
// TODO: during app init upsert these into db?
const { getConnectionsFromConfig } = require('../lib/connectionsFromConfig');

const { cipher, decipher } = makeCipher(config.get('passphrase'));

function decipherConnection(connection) {
  if (connection.username) {
    connection.username = decipher(connection.username);
  }
  if (connection.password) {
    connection.password = decipher(connection.password);
  }
  return connection;
}

function makeConnections(nedb) {
  async function findAll() {
    let connectionsFromDb = await nedb.connections.find({});
    connectionsFromDb = connectionsFromDb.map(conn => {
      conn.editable = true;
      return decipherConnection(conn);
    });

    const allConnections = connectionsFromDb.concat(getConnectionsFromConfig());
    return _.sortBy(allConnections, c => c.name.toLowerCase());
  }

  async function findOneById(id) {
    const connection = await nedb.connections.findOne({ _id: id });
    if (connection) {
      connection.editable = true;
      return decipherConnection(connection);
    }

    // If connection was not found in db try env
    const connectionFromEnv = getConnectionsFromConfig().find(
      connection => connection._id === id
    );

    return connectionFromEnv;
  }

  async function removeOneById(id) {
    return nedb.connections.remove({ _id: id });
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
      await nedb.connections.update({ _id }, connection, {});
      return findOneById(_id);
    }
    const newDoc = await nedb.connections.insert(connection);
    return findOneById(newDoc._id);
  }

  return {
    findAll,
    findOneById,
    removeOneById,
    save
  };
}

module.exports = makeConnections;
