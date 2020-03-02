const uuid = require('uuid/v4');
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
    this.id = uuid();
    this.connection = renderConnection(connection, user);
    this.driver = drivers[connection.driver];
    this.user = user;
    this.Client = this.driver.Client;
    this.connectedAt = null;

    // TODO how to handle TTL so connections aren't open forever

    appLog.debug(
      {
        originalConnection: connection,
        renderedConnection: this.connection,
        user
      },
      'Rendered connection for user'
    );
  }

  isConnected() {
    return Boolean(this.client);
  }

  async connect() {
    const { Client } = this;
    if (!Client) {
      throw new Error('Does not support persistent connection');
    }
    this.client = new Client(this.connection);
    await this.client.connect();
    this.connectedAt = new Date();
  }

  async disconnect() {
    if (this.client) {
      const client = this.client;
      this.client = null;
      await client.disconnect();
    }
  }

  /**
   * Run query using driver implementation of connection
   * If the connectionClient supports persistent database connections and is connected,
   * it'll use the database connection already established.
   * @param {*} query
   * @returns {Promise}
   */
  async runQuery(query) {
    const connection = this.connection;
    const driver = this.driver;
    const user = this.user;

    const finalResult = {
      id: uuid.v4(),
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
}

module.exports = ConnectionClient;
