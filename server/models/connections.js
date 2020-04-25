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
    const copy = _.cloneDeep(
      connection.toJSON ? connection.toJSON() : connection
    );
    copy.maxRows = Number(this.config.get('queryResultMaxRows'));
    const driver = drivers[connection.driver];
    if (!driver) {
      copy.supportsConnectionClient = false;
    } else {
      copy.supportsConnectionClient = Boolean(
        drivers[connection.driver].Client
      );
    }
    return copy;
  }

  decipherConnection(connection) {
    if (connection.data) {
      connection.data = JSON.parse(this.cryptr.decrypt(connection.data));
    }

    // For legacy use, spread data onto connection object
    // This isn't great but needed for backwards compat at this time
    Object.assign(connection, connection.data);

    return connection;
  }

  async findAll() {
    let connectionsFromDb = await this.sequelizeDb.Connections.findAll({});
    connectionsFromDb = connectionsFromDb.map(conn => {
      conn.editable = true;
      return this.decipherConnection(conn);
    });

    const allConnections = connectionsFromDb
      .concat(this.config.getConnections())
      .map(connection => this.decorateConnection(connection));

    return _.sortBy(allConnections, c => c.name.toLowerCase());
  }

  async findOneById(id) {
    let connection = await this.sequelizeDb.Connections.findOne({
      where: { id }
    });
    if (connection) {
      connection = connection.toJSON();
      connection.editable = true;
      connection = this.decorateConnection(connection);
      return this.decipherConnection(connection);
    }

    // If connection was not found in db try env
    const connectionFromEnv = this.config
      .getConnections()
      .find(connection => connection.id === id);

    if (!connectionFromEnv) {
      return null;
    }
    return this.decorateConnection(connectionFromEnv);
  }

  async removeOneById(id) {
    return this.sequelizeDb.Connections.destroy({ where: { id } });
  }

  async create(connection) {
    const { data, ...rest } = connection;
    rest.data = this.cryptr.encrypt(JSON.stringify(data || {}));

    const created = await this.sequelizeDb.Connections.create(rest);
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

    connection = validateConnection(connection);

    const {
      name,
      driver,
      multiStatementTransactionEnabled,
      idleTimeoutSeconds,
      data
    } = connection;

    let updateData = {
      name,
      driver,
      multiStatementTransactionEnabled,
      idleTimeoutSeconds
    };

    updateData.data = this.cryptr.encrypt(JSON.stringify(data));

    await this.sequelizeDb.Connections.update(updateData, { where: { id } });
    return this.findOneById(id);
  }
}

module.exports = Connections;
