import _ from 'lodash';
import Cryptr from 'cryptr';
import drivers from '../drivers/index.js';
import validateConnection from '../lib/validate-connection.js';

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
    if (!connection) return connection;

    const copy = _.cloneDeep(connection);
    copy.maxRows = Number(this.config.get('queryResultMaxRows'));

    const driver = drivers[connection.driver];
    if (!driver) {
      copy.supportsConnectionClient = false;
      copy.isAsynchronous = false;
    } else {
      copy.supportsConnectionClient = Boolean(driver.Client);
      copy.isAsynchronous = Boolean(driver.asynchronous);
    }

    // For legacy use, spread driver-field data onto connection object
    if (copy.data) {
      Object.assign(copy, copy.data);
    }

    return copy;
  }

  decipherConnection(connection) {
    if (connection.data && typeof connection.data === 'string') {
      try {
        connection.data = JSON.parse(connection.data); // Assume plain JSON
      } catch (err) {
        console.warn('Failed to parse connection.data as JSON:', err);
      }
    }

    return connection;
  }

  async findAll() {
    const dbConnections = await this.sequelizeDb.Connections.findAll({
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

    const dbConnectionsJson = dbConnections.map((conn) => {
      const jsonConn = conn.toJSON();
      jsonConn.deletable = true;
      jsonConn.editable = false;
      return this.decorateConnection(jsonConn);
    });

    const vaultConnections = this.config.getConnections().map((conn) =>
      this.decorateConnection({
        ...conn,
        deletable: false,
        editable: false, // Key points
      })
    );

    return _.sortBy([...dbConnectionsJson, ...vaultConnections], (c) =>
      c.name.toLowerCase()
    );
  }

  async findOneById(id) {
    let connection = await this.sequelizeDb.Connections.findOne({
      where: { id },
    });

    if (connection) {
      connection = connection.toJSON();
      connection.editable = false;
      connection.deletable = true;
      connection = this.decipherConnection(connection);
      return this.decorateConnection(connection);
    }

    const connectionFromEnv = this.config
      .getConnections()
      .find((conn) => conn.id === id);

    if (!connectionFromEnv) {
      return null;
    }

    return this.decorateConnection(connectionFromEnv);
  }

  async removeOneById(id) {
    return this.sequelizeDb.Connections.destroy({ where: { id } });
  }

  /**
   * @param {object} connection
   */
  async create(connection) {
    throw new Error(
      'Connection creation is disabled. Use Vault-based configuration.'
    );
  }

  /**
   * @param {string} id
   * @param {object} connection
   */
  async update(id, connection) {
    throw new Error(
      'Connection update is disabled. Use Vault-based configuration.'
    );
  }
}

export default Connections;
