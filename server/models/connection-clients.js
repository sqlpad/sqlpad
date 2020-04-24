const ConnectionClient = require('../lib/connection-client');

/**
 * ConnectionClients is a special in-memory store of connected database clients
 * Once a connectionClient disconnects, it should no longer be in this store
 * TODO: A UI could be built for admins to see open connections and close them
 */
class ConnectionClients {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
    this.connectionClients = [];
  }

  /**
   * Get all connection clients
   * @returns {array}
   */
  findAll() {
    return this.connectionClients.slice();
  }

  /**
   * Get connected connection client by id
   * @param {string} id - id of connection client
   * @returns {ConnectionClient}
   */
  getOneById(id) {
    return this.connectionClients.find(connectionClient => {
      return connectionClient.id === id;
    });
  }

  /**
   * Create new connection client and connect
   * @param {object} connection
   * @param {object} user
   * @returns {ConnectionClient}
   */
  async createNew(connection, user) {
    const connectionClient = new ConnectionClient(connection, user);
    await connectionClient.connect();
    connectionClient.scheduleCleanupInterval();
    this.connectionClients.push(connectionClient);
    return this.getOneById(connectionClient.id);
  }

  /**
   * Disconnect connection client for id, and remove it from in-memory store.
   * Operates under the assumption that the connection could have been removed since its removal was requested
   * @param {string} id
   */
  async disconnectForId(id) {
    const connectionClient = this.getOneById(id);

    // remove client from array immediately
    // Disconnecting is async but in-memory state should represent what things will be
    this.connectionClients = this.connectionClients.filter(connectionClient => {
      return connectionClient.id !== id;
    });

    if (connectionClient) {
      await connectionClient.disconnect();
    }
  }
}

module.exports = ConnectionClients;
