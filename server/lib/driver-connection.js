const uuid = require('uuid/v4');
const drivers = require('../drivers');
const renderConnection = require('./render-connection');
const appLog = require('./appLog');
const getMeta = require('./getMeta');

/**
 * Driver connection represents a driver and connection pairing, resulting in a connected database connection.
 * In the future, it will optionally support a persisted connection,
 * maintaining state about whether a connection is connected or not.
 * These persisted connections will be reused across runQuery calls.
 */
class DriverConnection {
  /**
   * @param {object} connection
   * @param {object} [user] - user to run query under. may not be provided if chart links turned on
   */
  constructor(connection, user) {
    this.id = uuid();
    this.connection = renderConnection(connection, user);
    this.driver = drivers[connection.driver];
    this.user = user;

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
   * Run query using driver implementation of connection
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
      results = await driver.runQuery(query, connection);
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

module.exports = DriverConnection;
