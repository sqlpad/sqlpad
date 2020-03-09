const { v4: uuidv4, v5: uuidv5 } = require('uuid');
const consts = require('./consts');
const drivers = require('../drivers');
const renderConnection = require('./render-connection');
const appLog = require('./appLog');
const getMeta = require('./getMeta');

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
    this.user = user;
    this.Client = this.driver.Client;
    this.connectedAt = null;

    appLog.debug(
      {
        originalConnection: connection,
        renderedConnection: this.connection,
        user
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
   * This may need to actually make a db call if drivers implement an automatic disconnect after some period of inactivity
   */
  keepAlive() {
    if (this.isConnected()) {
      this.lastKeepAliveAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Create a persistent database connection if the driver implementation supports it.
   * Also sets up a poll to check on keep alive requests,
   * and disconnects the connection if a user is not actively using the connection
   */
  async connect() {
    const { Client } = this;
    if (!Client) {
      throw new Error('Does not support persistent connection');
    }
    this.client = new Client(this.connection);
    await this.client.connect();
    this.connectedAt = new Date();
    this.lastKeepAliveAt = new Date();

    // Every n ms check to see if lastKeepAliveAt is too old
    // If it is too old, disconnect this
    this.cleanupInterval = setInterval(() => {
      appLog.info('Checking last keep alive at');
      const now = new Date();
      const TIMEOUT = 30000;
      if (now - this.lastKeepAliveAt > TIMEOUT) {
        this.disconnect().catch(error => appLog.error(error));
        if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval);
        }
        const id = this.id;
        const connectionName = this.connection && this.connection.name;
        const driver = this.connection && this.connection.driver;
        appLog.debug(
          { id, connectionName, driver },
          'Disconnecting client connection'
        );
      }
    }, 10000);
  }

  /**
   * Close the database connection
   */
  async disconnect() {
    if (this.client) {
      const client = this.client;
      this.client = null;
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
      cacheKey: null,
      startTime: new Date(),
      stopTime: null,
      queryRunTime: null,
      fields: [],
      incomplete: false,
      meta: {},
      rows: []
    };

    const connectionName = connection.name;

    const queryContext = {
      driver: connection.driver,
      userId: user && user._id,
      userEmail: user && user.email,
      connectionId: connection._id,
      connectionName,
      query,
      startTime: finalResult.startTime
    };

    appLog.info(queryContext, 'Running query');

    let results;
    try {
      // If client is connected use that connection,
      // otherwise use driver.runQuery to run query with fresh one-off connection
      if (this.isConnected()) {
        // uses pre-existing connection to run query, and keeps connection open
        results = await this.client.runQuery(query);
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

    let { rows, incomplete, suppressedResultSet } = results;

    if (!Array.isArray(rows)) {
      appLog.warn(
        {
          driver: connection.driver,
          connectionId: connection._id,
          connectionName,
          query
        },
        'Expected rows to be an array but received %s.',
        typeof rows
      );
      rows = [];
    }

    finalResult.incomplete = Boolean(incomplete);
    finalResult.suppressedResultSet = Boolean(suppressedResultSet);
    finalResult.rows = rows;
    finalResult.stopTime = new Date();
    finalResult.queryRunTime = finalResult.stopTime - finalResult.startTime;
    finalResult.meta = getMeta(rows);
    finalResult.fields = Object.keys(finalResult.meta);

    appLog.info(
      {
        ...queryContext,
        stopTime: finalResult.stopTime,
        queryRunTime: finalResult.queryRunTime,
        rowCount: rows.length,
        incomplete: finalResult.incomplete,
        suppressedResultSet: finalResult.suppressedResultSet
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
      maxRows: Number.MAX_SAFE_INTEGER
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
      .map(key => {
        return `${key}:${this.connection[key]}`;
      })
      .join('::');

    return (
      'schemacache:' + uuidv5(keyValuesString, consts.CONNECTION_HASH_NAMESPACE)
    );
  }
}

module.exports = ConnectionClient;
