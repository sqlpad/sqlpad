/* eslint-disable no-await-in-loop */
const ConnectionClient = require('./connection-client');

/**
 * Execute a query using batch/statement infrastructure
 * Batch must already be created.
 * Returns last statement result on finish to remain compatible with old "query-result" use
 * @param {import('../models/index')} models
 * @param {string} batchId
 */
async function executeBatch(models, batchId) {
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
  let errored = false;
  for (const statement of batch.statements) {
    try {
      await models.statements.updateStarted(statement.id);
      queryResult = await connectionClient.runQuery(statement.statementText);
      await models.statements.updateFinished(statement.id, queryResult);
    } catch (error) {
      errored = true;
      await models.statements.updateErrored(statement.id, {
        title: error.message,
      });
      await models.batches.updateStatus(batch.id, 'error');
      break;
    }
  }

  if (!errored) {
    await models.batches.updateStatus(batch.id, 'finished');
  }

  if (disconnectOnFinish) {
    await connectionClient.disconnect();
  }

  return queryResult;
}

module.exports = executeBatch;
