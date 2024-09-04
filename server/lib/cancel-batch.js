/* eslint-disable no-await-in-loop */
import ConnectionClient from './connection-client.js';

import appLog from './app-log.js';

/**
 * Execute a query using batch/statement infrastructure
 * Batch must already be created.
 * @param {Object} config
 * @param {import('../models/index')} models
 * @param {import('./webhooks')} webhooks
 * @param {string} batchId
 */
export async function cancelBatch(models, webhooks, batchId) {
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
  const batchStartTime = new Date();
  let stopTime;
  let statementError;
  let statementStartTime;
  for (const statement of batch.statements) {
    statementStartTime = new Date();
    try {
      appLog.trace(
        `Cancelling statement ${statement.executionId} by ${user.email} - ${statement.statementText}`
      );

      await connectionClient.cancelQuery(statement.executionId);
      stopTime = new Date();
      await models.statements.updateCancelled(statement.id, stopTime);
      webhooks.statementCancelled(user, connection, batch, statement.id);
    } catch (error) {
      appLog.error(`Error found cancelling statement: ${error}`);
      statementError = error;
      stopTime = new Date();

      await models.statements.updateErrored(
        statement.id,
        {
          title: error.message,
        },
        stopTime,
        stopTime - statementStartTime
      );

      const updatedBatch = await models.batches.update(batch.id, {
        status: 'cancelled',
        stopTime,
        durationMs: stopTime - batchStartTime,
      });

      webhooks.statementCancelled(user, connection, updatedBatch, statement.id);
    }
  }
  stopTime = new Date();

  if (!statementError) {
    await models.batches.update(batch.id, {
      status: 'cancelled',
      stopTime,
      durationMs: stopTime - batchStartTime,
    });
  }

  if (disconnectOnFinish) {
    await connectionClient.disconnect();
  }

  const finalBatch = await models.batches.findOneById(batchId);
  webhooks.batchFinished(user, connection, finalBatch);
  return true;
}
