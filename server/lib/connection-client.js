const { v4: uuidv4, v5: uuidv5 } = require('uuid');
const consts = require('./consts');
const drivers = require('../drivers');
const renderConnection = require('./render-connection');
const appLog = require('./app-log');
const getMeta = require('./get-meta');

/**
 * Connection client runs queries for a given connection and user
 * It wraps the driver implementation used by the connection configuration
 * Older-style driver implementations are one-off functions.
 * Database connections are made, the user query is run, and then the database connection is closed.
 * Newer-style driver implementations may include a `Client` class,
 * which provides the ability to connect and disconnect to the database, and run queries with that connection.
 */
class ConnectionClient {
  /**
   * @param {object} connection
   * @param {object} [user] - user to run query under. may not be provided if chart links turned on
   */
  constructor(connection, user) {
    this.id = uuidv4();
    this.connection = renderConnection(connection, user);
    this.driver = drivers[connection.driver];

    if (!this.driver) {
      throw new Error('Invalid driver');
    }

    this.user = user;
    this.Client = this.driver.Client;
    this.connectedAt = null;

    appLog.debug(
      {
        connectionClientId: this.id,
        originalConnection: connection,
        renderedConnection: this.connection,
        user,
      },
      'Rendered connection for user'
    );
  }

  /**
   * Determines whether the connectionClient is connected to the db.
   * For now the existence of this.client indicates an open connection
   */
  isConnected() {
    return Boolean(this.client);
  }

  /**
   * Updates lastKeepAliveAt to indicate a request was made to keep this connection alive.
   * This may need to actually make a db call if drivers implement an automatic disconnect after some period of idle
   */
  keepAlive() {
    if (this.isConnected()) {
      this.lastKeepAliveAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get last keep alive at time
   */
  getLastKeepAliveAt() {
    return this.lastKeepAliveAt;
  }

  /**
   * Get last activity at time (last time user ran query with connected client)
   */
  getLastActivityAt() {
    return this.lastActivityAt;
  }

  getConnectionName() {
    return this.connection.name;
  }

  getConnectionDriver() {
    return this.connection.driver;
  }

  /**
   * Set up a poll to check on keep alive and activity requests
   * and disconnect if keep alive has not been updated within range of keepAliveTimeoutMs or idleTimeoutSeconds (seconds)
   * @param {number} [keepAliveTimeoutMs] - max amount of time to allow from keep alive ping before closing
   * @param {number} [intervalMs] - interval ms to check keep alive time
   */
  scheduleCleanupInterval(keepAliveTimeoutMs = 30000, intervalMs = 10000) {
    this.keepAlive();

    const ONE_HOUR_SECONDS = 60 * 60;
    const idleTimeoutSeconds =
      parseInt(this.connection.idleTimeoutSeconds, 10) || ONE_HOUR_SECONDS;
    const idleTimeoutMs = idleTimeoutSeconds * 1000;

    this.cleanupInterval = setInterval(() => {
      const now = new Date();
      const sinceLastKeepAliveMs = now - this.getLastKeepAliveAt();
      const sinceLastActivityMs = now - this.getLastActivityAt();

      const keepAliveExceeded = sinceLastKeepAliveMs > keepAliveTimeoutMs;
      const lastActivityExceeded = sinceLastActivityMs > idleTimeoutMs;

      if (keepAliveExceeded || lastActivityExceeded) {
        let msg = '';
        if (keepAliveExceeded) {
          msg += `Connection client keep alive exceeded timeout of ${keepAliveTimeoutMs}`;
        } else {
          msg += `Connection client last activity exceeded timeout of ${idleTimeoutMs}`;
        }
        appLog.debug(
          {
            connectionClientId: this.id,
            connectionName: this.getConnectionName(),
            driver: this.getConnectionDriver(),
            sinceLastKeepAliveMs,
            sinceLastActivityMs,
          },
          msg
        );
        this.disconnect().catch((error) => appLog.error(error));
      }
    }, intervalMs);
  }

  /**
   * Create a persistent database connection if the driver implementation supports it.
   */
  async connect() {
    const { Client } = this;
    if (!Client) {
      throw new Error('Does not support persistent connection');
    }
    this.client = new Client(this.connection);
    await this.client.connect();
    this.connectedAt = new Date();
    this.lastActivityAt = new Date();
    this.keepAlive();
  }

  /**
   * Close the database connection
   */
  async disconnect() {
    // Remove cleanup interval if it had been scheduled
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      delete this.cleanupInterval;
    }
    // If client still exists disconnect
    if (this.client) {
      const client = this.client;
      this.client = null;
      const connectionName = this.getConnectionName();
      const driver = this.getConnectionDriver();
      appLog.debug(
        { connectionClientId: this.id, connectionName, driver },
        'Disconnecting client connection'
      );
      await client.disconnect();
    }
  }

  /**
   * Run query
   * If the connectionClient supports persistent database connections and is connected,
   * it'll use the database connection already established.
   * If not connected or does not support persistent connection,
   * it uses the driver.runQuery() implementation that will open a connection, run query, then close.
   * @param {string} query
   * @returns {Promise}
   */
  async runQuery(query) {
    const connection = this.connection;
    const driver = this.driver;
    const user = this.user;

    const finalResult = {
      id: uuidv4(),
      startTime: new Date(),
      stopTime: null,
      queryRunTime: null,
      fields: [],
      incomplete: false,
      meta: {},
      rows: [],
    };

    const connectionName = connection.name;

    const queryContext = {
      connectionClientId: this.id,
      driver: connection.driver,
      userId: user && user.id,
      userEmail: user && user.email,
      connectionId: connection.id,
      connectionName,
      query,
      startTime: finalResult.startTime,
    };

    appLog.info(queryContext, 'Running query');

    let results;
    try {
      // If client is connected use that connection,
      // otherwise use driver.runQuery to run query with fresh one-off connection
      if (this.isConnected()) {
        // uses pre-existing connection to run query, and keeps connection open
        // lastActivityAt is updated both before and after query (the query could take a while)
        this.lastActivityAt = new Date();
        results = await this.client.runQuery(query);
        this.lastActivityAt = new Date();
      } else {
        // Opens a new connection to db, runs query, then closes connection
        results = await driver.runQuery(query, connection);
      }
    } catch (error) {
      // It is logged INFO because it isn't necessarily a server/application error
      // It could just be a bad query
      appLog.info(
        { ...queryContext, error: error.toString() },
        'Error running query'
      );

      // Rethrow the error
      // The error here is something expected and should be shown to user
      throw error;
    }

    let { rows, incomplete } = results;

    if (!Array.isArray(rows)) {
      appLog.warn(
        {
          driver: connection.driver,
          connectionId: connection.id,
          connectionName,
          query,
        },
        'Expected rows to be an array but received %s.',
        typeof rows
      );
      rows = [];
    }

    finalResult.incomplete = Boolean(incomplete);
    finalResult.rows = rows;
    finalResult.stopTime = new Date();
    finalResult.queryRunTime = finalResult.stopTime - finalResult.startTime;
    finalResult.meta = getMeta(rows);
    finalResult.fields = Object.keys(finalResult.meta);
    finalResult.columns = Object.entries(finalResult.meta).map(
      ([key, value]) => {
        return { ...value, name: key };
      }
    );

    appLog.info(
      {
        ...queryContext,
        stopTime: finalResult.stopTime,
        queryRunTime: finalResult.queryRunTime,
        rowCount: rows.length,
        incomplete: finalResult.incomplete,
      },
      'Query finished'
    );

    return finalResult;
  }

  /**
   * Test connection passed in using the driver implementation
   * As long as promise resolves without error
   * it is considered a successful connection config
   */
  testConnection() {
    return this.driver.testConnection(this.connection);
  }

  /**
   * Gets schema (sometimes called schemaInfo) for connection
   * This data is used by client to build schema tree in editor sidebar
   * @returns {Promise}
   */
  getSchema() {
    // Increase the max rows without modifiying original connection
    const connectionMaxed = {
      ...this.connection,
      // 1 million rows ought to be enough for pulling schema.
      // Schema probably needs to be broken up into getting tables (and their schemas), and then batching column reads
      maxRows: 1000000,
    };
    return this.driver.getSchema(connectionMaxed);
  }

  /**
   * A given connection may no longer return the same result given user template support
   * To ensure schema is appropriately cached an ID must be derived from the resulting connection for a user
   * Its possible and likely that a given connection will be the same for a few users,
   * so we don't want to cache this on (connectionId, userId) pairing.
   * Instead we'll use a hash of connection after template rendering
   */
  getSchemaCacheId() {
    const keyValuesString = Object.keys(this.connection)
      .sort()
      .map((key) => {
        return `${key}:${this.connection[key]}`;
      })
      .join('::');

    return (
      'schemacache:' + uuidv5(keyValuesString, consts.CONNECTION_HASH_NAMESPACE)
    );
  }
}

module.exports = ConnectionClient;
