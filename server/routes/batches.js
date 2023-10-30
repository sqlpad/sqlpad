import '../typedefs.js';
import moment from 'moment';
import mustBeAuthenticated from '../middleware/must-be-authenticated.js';
import { executeBatch, executeCancellableBatch } from '../lib/execute-batch.js';
import { cancelBatch } from '../lib/cancel-batch.js';
import wrap from '../lib/wrap.js';
import mustHaveConnectionAccess from '../middleware/must-have-connection-access.js';
import express from 'express';
const router = express.Router();

/**
 * Create batch
 * @param {Req} req
 * @param {Res} res
 */
async function create(req, res) {
  const { config, models, body, user, appLog, webhooks } = req;
  const {
    queryId,
    name,
    connectionId,
    connectionClientId,
    batchText,
    selectedText,
    chart,
  } = body;

  const batch = {
    queryId,
    name,
    connectionId,
    connectionClientId,
    batchText,
    selectedText,
    chart,
    userId: user.id,
  };

  const connection = await models.connections.findOneById(connectionId);
  const newBatch = await models.batches.create(batch);

  webhooks.batchCreated(user, connection, newBatch);
  for (const statement of newBatch.statements) {
    webhooks.statementCreated(user, connection, newBatch, statement);
  }

  // Run batch, but don't wait for it to send response
  // Client will get status via polling or perhaps some future event mechanism
  if (newBatch.status !== 'error') {
    if (connection.isAsynchronous) {
      // Wait for all execution IDs to be available for cancellation
      await executeCancellableBatch(
        config,
        models,
        webhooks,
        newBatch.id
      ).catch((error) => appLog.error(error));
    }
    executeBatch(config, models, webhooks, newBatch.id).catch((error) =>
      appLog.error(error)
    );
  }

  return res.utils.data(newBatch);
}

router.post(
  '/api/batches',
  mustBeAuthenticated,
  mustHaveConnectionAccess,
  wrap(create)
);

/**
 * List batches.
 * Restricted to batches for the currently logged in user
 * @param {Req} req
 * @param {Res} res
 */
async function list(req, res) {
  const { models, user, query } = req;
  const { queryId, includeStatements } = query;

  let batches;
  if (queryId) {
    const cleanedQueryId = queryId === 'null' ? null : queryId;
    let cleanedIncludeStatements = false;
    if (includeStatements) {
      cleanedIncludeStatements =
        includeStatements.toString().toLowerCase().trim() === 'true';
    }

    batches = await models.batches.findAllForUserQuery(
      user,
      cleanedQueryId,
      cleanedIncludeStatements
    );
  } else {
    batches = await models.batches.findAllForUser(user);
  }

  batches.forEach((batch) => {
    batch.startTimeCalendar = moment(batch.startTime).calendar();
    batch.stopTimeCalendar = moment(batch.stopTime).calendar();
    batch.createdAtCalendar = moment(batch.createdAt).calendar();
  });

  return res.utils.data(batches);
}

router.get('/api/batches', mustBeAuthenticated, wrap(list));

async function batchToReq(req, res, next) {
  try {
    const { models, user, params } = req;
    const batch = await models.batches.findOneById(params.batchId);

    if (!batch) {
      return res.utils.notFound();
    }

    if (batch.userId !== user.id.toString()) {
      return res.utils.forbidden();
    }

    req.batch = batch;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Get batch by id.
 * Only batches created by that user are permitted.
 * Eventually this may need to expand to basing this on whether user has access to that query and/or connection
 * @param {Req} req
 * @param {Res} res
 */
async function getBatch(req, res) {
  return res.utils.data(req.batch);
}

router.get(
  '/api/batches/:batchId',
  mustBeAuthenticated,
  batchToReq,
  wrap(getBatch)
);

/**
 * Get statements for batch.
 * Only statements from batch created by that user are permitted.
 * Eventually this may need to expand to basing this on whether user has access to that query and/or connection
 *
 * @param {Req} req
 * @param {Res} res
 */
async function getBatchStatements(req, res) {
  const { batch } = req;
  return res.utils.data(batch.statements);
}

router.get(
  '/api/batches/:batchId/statements',
  mustBeAuthenticated,
  batchToReq,
  wrap(getBatchStatements)
);

/**
 * Cancel batch
 * @param {Req} req
 * @param {Res} res
 */
async function cancel(req, res) {
  const { models, appLog, webhooks, body } = req;

  const { connectionId } = body;

  const id = req.params.batchId;

  const connection = await models.connections.findOneById(connectionId);
  const batch = await models.batches.findOneById(id);

  if (batch.status !== 'error') {
    if (!connection.isAsynchronous) {
      return res.utils.error(
        'Cancel batch is only available to drivers that support cancellation'
      );
    }

    await cancelBatch(models, webhooks, batch.id).catch((error) =>
      appLog.error(error)
    );
  }
  const updatedBatch = await models.batches.findOneById(id);
  appLog.trace(updatedBatch);
  return res.utils.data(updatedBatch);
}

router.put(
  '/api/batches/:batchId/cancel',
  mustBeAuthenticated,
  mustHaveConnectionAccess,
  batchToReq,
  wrap(cancel)
);

export default router;
