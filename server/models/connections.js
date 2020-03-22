const _ = require('lodash');
const makeCipher = require('../lib/make-cipher');
const drivers = require('../drivers');
const validateConnection = require('../lib/validate-connection');

function addSupportsConnectionClient(connection) {
  if (!connection) {
    return connection;
  }
  const copy = _.cloneDeep(connection);
  const driver = drivers[connection.driver];
  if (!driver) {
    copy.supportsConnectionClient = false;
  } else {
    copy.supportsConnectionClient = Boolean(drivers[connection.driver].Client);
  }
  return copy;
}

class Connections {
  /**
   * @param {*} nedb
   * @param {*} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(nedb, sequelizeDb, config) {
    this.nedb = nedb;
    this.sequelizeDb = sequelizeDb;
    this.config = config;
    const { cipher, decipher } = makeCipher(config.get('passphrase'));
    this.cipher = cipher;
    this.decipher = decipher;
  }

  decipherConnection(connection) {
    if (connection.username) {
      connection.username = this.decipher(connection.username);
    }
    if (connection.password) {
      connection.password = this.decipher(connection.password);
    }
    return connection;
  }

  async findAll() {
    let connectionsFromDb = await this.nedb.connections.find({});
    connectionsFromDb = connectionsFromDb.map(conn => {
      conn.editable = true;
      return this.decipherConnection(conn);
    });

    const allConnections = connectionsFromDb
      .concat(this.config.getConnections())
      .map(connection => addSupportsConnectionClient(connection));

    return _.sortBy(allConnections, c => c.name.toLowerCase());
  }

  async findOneById(id) {
    let connection = await this.nedb.connections.findOne({ _id: id });
    if (connection) {
      connection.editable = true;
      connection = addSupportsConnectionClient(connection);
      return this.decipherConnection(connection);
    }

    // If connection was not found in db try env
    const connectionFromEnv = this.config
      .getConnections()
      .find(connection => connection._id === id);

    if (!connectionFromEnv) {
      return null;
    }
    return addSupportsConnectionClient(connectionFromEnv);
  }

  async removeOneById(id) {
    return this.nedb.connections.remove({ _id: id });
  }

  // TODO - break save function out into create/update
  async save(connection) {
    if (!connection) {
      throw new Error('connections.save() requires a connection');
    }

    connection.username = this.cipher(connection.username || '');
    connection.password = this.cipher(connection.password || '');

    if (!connection.createdDate) {
      connection.createdDate = new Date();
    }
    connection.modifiedDate = new Date();

    connection = validateConnection(connection);
    const { _id } = connection;

    const existing = await this.findOneById(_id);
    if (existing) {
      await this.nedb.connections.update({ _id }, connection, {});
      return this.findOneById(_id);
    }

    const newDoc = await this.nedb.connections.insert(connection);
    return this.findOneById(newDoc._id);
  }
}

module.exports = Connections;
