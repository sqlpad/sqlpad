const _ = require('lodash');
const Cryptr = require('cryptr');
const drivers = require('../drivers');
const validateConnection = require('../lib/validate-connection');

class Connections {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
    this.cryptr = new Cryptr(config.get('passphrase'));
  }

  decorateConnection(connection) {
    if (!connection) {
      return connection;
    }
    const copy = _.cloneDeep(connection);
    copy.maxRows = Number(this.config.get('queryResultMaxRows'));
    const driver = drivers[connection.driver];
    if (!driver) {
      copy.supportsConnectionClient = false;
    } else {
      copy.supportsConnectionClient = Boolean(
        drivers[connection.driver].Client
      );
    }

    // For legacy use, spread driver-field data onto connection object
    // This isn't great but needed for backwards compat at this time
    if (copy.data) {
      Object.assign(copy, copy.data);
    }

    return copy;
  }

  decipherConnection(connection) {
    if (connection.data && typeof connection.data === 'string') {
      connection.data = JSON.parse(this.cryptr.decrypt(connection.data));
    }

    return connection;
  }

  async findAll() {
    let connectionsFromDb = await this.sequelizeDb.Connections.findAll({
      attributes: [
        'id',
        'name',
        'description',
        'driver',
        'multiStatementTransactionEnabled',
        'idleTimeoutSeconds',
        'createdAt',
        'updatedAt',
      ],
    });
    connectionsFromDb = connectionsFromDb.map((conn) => {
      let jsonConn = conn.toJSON();
      jsonConn.editable = true;
      return jsonConn;
    });

    const allConnections = connectionsFromDb
      .concat(this.config.getConnections())
      .map((connection) => this.decorateConnection(connection));

    return _.sortBy(allConnections, (c) => c.name.toLowerCase());
  }

  async findOneById(id) {
    let connection = await this.sequelizeDb.Connections.findOne({
      where: { id },
    });
    if (connection) {
      connection = connection.toJSON();
      connection.editable = true;
      connection = this.decipherConnection(connection);
      return this.decorateConnection(connection);
    }

    // If connection was not found in db try env
    const connectionFromEnv = this.config
      .getConnections()
      .find((connection) => connection.id === id);

    if (!connectionFromEnv) {
      return null;
    }
    return this.decorateConnection(connectionFromEnv);
  }

  async removeOneById(id) {
    return this.sequelizeDb.Connections.destroy({ where: { id } });
  }

  /**
   *
   * @param {object} connection
   */
  async create(connection) {
    const {
      id,
      name,
      description,
      driver,
      multiStatementTransactionEnabled,
      idleTimeoutSeconds,
      data,
      createdAt,
      updatedAt,
      ...legacyDriverFields
    } = connection;

    let createObj = {
      id,
      name,
      description,
      driver,
      multiStatementTransactionEnabled,
      idleTimeoutSeconds,
    };

    // Old connections had driver-specific fields flat on connection object
    // With v5 those moved to data, but the old format needs to be supported
    // if data is supplied, we assume that this is a new format
    // if no data, then we assume all fields we don't know about are driver-specific fields
    if (data) {
      createObj.data = data;
    } else {
      createObj.data = legacyDriverFields;
    }

    createObj = validateConnection(createObj);

    // if data is set encrypt it
    if (createObj.data) {
      createObj.data = this.cryptr.encrypt(JSON.stringify(createObj.data));
    }

    const created = await this.sequelizeDb.Connections.create(createObj);
    return this.findOneById(created.id);
  }

  /**
   *
   * @param {string} id - id of connection
   * @param {object} connection - connection object with .data field
   */
  async update(id, connection) {
    if (!connection) {
      throw new Error('connection required');
    }

    // Below uses destructing to deduce legacy driver fields
    // id is already declared in function, so it is being cloned and deleted here
    const clone = { ...connection };
    delete clone.id;

    const {
      name,
      description,
      driver,
      multiStatementTransactionEnabled,
      idleTimeoutSeconds,
      data,
      createdAt,
      updatedAt,
      ...legacyDriverFields
    } = clone;

    let updateObj = {
      id,
      name,
      description,
      driver,
      multiStatementTransactionEnabled,
      idleTimeoutSeconds,
    };

    // Old connections had driver-specific fields flat on connection object
    // With v5 those moved to data, but the old format needs to be supported
    // if data is supplied, we assume that this is a new format
    // if no data, then we assume all fields we don't know about are driver-specific fields
    if (data) {
      updateObj.data = data;
    } else {
      updateObj.data = legacyDriverFields;
    }

    updateObj = validateConnection(updateObj);

    // if data is set encrypt it
    if (updateObj.data) {
      updateObj.data = this.cryptr.encrypt(JSON.stringify(updateObj.data));
    }

    await this.sequelizeDb.Connections.update(updateObj, { where: { id } });
    return this.findOneById(id);
  }
}

module.exports = Connections;
