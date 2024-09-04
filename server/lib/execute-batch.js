/* eslint-disable no-await-in-loop */
import ConnectionClient from './connection-client.js';

/**
 * Execute a query using batch/statement infrastructure
 * Batch must already be created.
 * @param {Object} config
 * @param {import('../models/index')} models
 * @param {import('./webhooks')} webhooks
 * @param {string} batchId
 */
export async function executeBatch(config, models, webhooks, batchId) {
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
  let queryResult;
  let statementError;
  let statementStartTime;
  for (const statement of batch.statements) {
    statementStartTime = new Date();
    const input = connectionClient.driver['asynchronous']
      ? statement.executionId
      : statement.statementText;
    try {
      await models.statements.updateStarted(statement.id, statementStartTime);
      queryResult = await connectionClient.runQuery(input);
      stopTime = new Date();
      await models.statements.updateFinished(
        statement.id,
        queryResult,
        stopTime,
        stopTime - statementStartTime
      );
      webhooks.statementFinished(user, connection, batch, statement.id);
    } catch (error) {
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
        status: 'error',
        stopTime,
        durationMs: stopTime - batchStartTime,
      });
      webhooks.statementFinished(user, connection, updatedBatch, statement.id);
      break;
    }
  }
  stopTime = new Date();

  if (statementError) {
    await models.statements.updateErrorQueuedToCancelled(batchId);
  }

  if (!statementError) {
    await models.batches.update(batch.id, {
      status: 'finished',
      stopTime,
      durationMs: stopTime - batchStartTime,
    });
  }

  if (disconnectOnFinish) {
    await connectionClient.disconnect();
  }

  const finalBatch = await models.batches.findOneById(batchId);
  webhooks.batchFinished(user, connection, finalBatch);
}

/**
 * Execute a query using batch/statement infrastructure
 * Batch must already be created.
 * @param {Object} config
 * @param {import('../models/index')} models
 * @param {import('./webhooks')} webhooks
 * @param {string} batchId
 */
export async function executeCancellableBatch(
  config,
  models,
  webhooks,
  batchId
) {
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
  let executionId;
  let statementStartTime;
  let stopTime;
  let statementError;
  for (const statement of batch.statements) {
    try {
      statementStartTime = new Date();
      await models.statements.updateStarted(statement.id, statementStartTime);
      if (connectionClient.driver['asynchronous']) {
        // Set execution ID ASAP to enable cancellation
        executionId = await connectionClient.startQueryExecution(
          statement.statementText
        );

        await models.statements.updateExecutionId(statement.id, executionId);
      }
    } catch (error) {
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
        status: 'error',
        stopTime,
        durationMs: stopTime - batchStartTime,
      });
      webhooks.statementFinished(user, connection, updatedBatch, statement.id);
      break;
    }
  }
  if (statementError) {
    await models.statements.updateErrorQueuedToCancelled(batchId);
  }
  if (disconnectOnFinish) {
    await connectionClient.disconnect();
  }

  const finalBatch = await models.batches.findOneById(batchId);
  webhooks.batchFinished(user, connection, finalBatch);
}
