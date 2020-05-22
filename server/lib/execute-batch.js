/* eslint-disable no-await-in-loop */
const ConnectionClient = require('./connection-client');

/**
 * Execute a query using batch/statement infrastructure
 * Batch must already be created.
 * Returns last statement result on finish to remain compatible with old "query-result" use
 * @param {Object} config
 * @param {Object} user
 * @param {import('../models/index')} models
 * @param {string} batchId
 */
async function executeBatch(config, models, batchId) {
  const batch = await models.batches.findOneById(batchId);
  const user = await models.users.findOneById(batch.userId);
  const connection = await models.connections.findOneById(batch.connectionId);

  // Get existing connectionClient if one was specified to use per batch
  // Otherwise create a new one and connect it if the ConnectionClient supports it.
  // If a new connectionClient was created *and* connected, take note to disconnect later
  let connectionClient;
  let disconnectOnFinish = false;
  if (batch.connectionClientId) {
    connectionClient = models.connectionClients.getOneById(
      batch.connectionClientId
    );
    if (!connectionClient) {
      throw new Error('Connection client disconnected');
    }
  } else {
    connectionClient = new ConnectionClient(connection, user);
    // If connectionClient supports the "Client" driver,
    // and it is not connected, connect it
    if (connectionClient.Client && !connectionClient.isConnected()) {
      await connectionClient.connect();
      disconnectOnFinish = true;
    }
  }

  // run statements
  let queryResult;
  for (const statement of batch.statements) {
    try {
      await models.statements.update(statement.id, {
        status: 'started',
      });
      queryResult = await connectionClient.runQuery(statement.statementText);
      await models.statements.update(statement.id, {
        status: 'finished',
        columns: queryResult.columns,
        rowCount: queryResult.rows.length,
      });
    } catch (error) {
      await models.statements.update(statement.id, {
        status: 'error',
        error,
      });
    }
  }

  if (disconnectOnFinish) {
    await connectionClient.disconnect();
  }

  return queryResult;
}

module.exports = executeBatch;
