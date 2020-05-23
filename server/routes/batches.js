require('../typedefs');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const executeBatch = require('../lib/execute-batch');
const wrap = require('../lib/wrap');
const papa = require('papaparse');
const readFile = promisify(fs.readFile);

/**
 * Create batch
 * @param {Req} req
 * @param {Res} res
 */
async function create(req, res) {
  const { models, body, user, appLog } = req;
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

  const newBatch = await models.batches.create(batch);

  // Run batch, but don't wait for it to send response
  // Client will get status via polling or perhaps some future event mechanism
  executeBatch(models, newBatch.id).catch((error) => appLog.error(error));

  return res.utils.data(newBatch);
}

router.post('/api/batches', mustBeAuthenticated, wrap(create));

/**
 * List batches.
 * Restricted to batches for the currently logged in user
 * @param {Req} req
 * @param {Res} res
 */
async function list(req, res) {
  const { models, user } = req;
  const batches = await models.batches.findAllForUser(user);
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

    if (batch.userId !== user.id) {
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
 * Get batch statement
 * Only statement from batch created by that user are permitted.
 * Eventually this may need to expand to basing this on whether user has access to that query and/or connection
 * @param {Req} req
 * @param {Res} res
 */
async function getBatchStatement(req, res) {
  const { params, batch } = req;

  const statement = batch.statements.find((s) => s.id === params.statementId);
  if (!statement) {
    return res.utils.notFound();
  }

  return res.utils.data(statement);
}

router.get(
  '/api/batches/:batchId/statements/:statementId',
  mustBeAuthenticated,
  batchToReq,
  wrap(getBatchStatement)
);

/**
 * Get batch statement results
 * Only statement from batch created by that user are permitted.
 * Eventually this may need to expand to basing this on whether user has access to that query and/or connection
 *
 * TODO - finalize data format.
 * Sends JSON because this is /api, and for client convenience.
 * CSV can be different route along with xlsx, JSON
 *
 * @param {Req} req
 * @param {Res} res
 */
async function getBatchStatementResults(req, res) {
  const { config, params, batch } = req;

  const statement = batch.statements.find((s) => s.id === params.statementId);
  if (!statement) {
    return res.utils.notFound();
  }

  const { resultPath } = statement;

  // If no result path the query had no rows.
  // Send empty array in case this is called.
  if (!resultPath) {
    return res.utils.data([]);
  }

  const fileData = await readFile(
    path.join(config.get('dbPath'), resultPath),
    'utf8'
  );
  const { data, errors } = papa.parse(fileData);

  // If there are errors this is unexpected and something the user cannot control
  // Throw the first error message to return a 500
  if (errors && errors.length) {
    throw new Error(errors[0].message);
  }

  function cleanRow(row) {
    return statement.columns.map((column, index) => {
      const colValue = row[index];
      if (column.type === 'number') {
        if (colValue === null || colValue.trim() === '') {
          return null;
        }
        if (isNaN(colValue)) {
          return colValue;
        }
        return Number(colValue);
      }
      return colValue;
    });
  }

  // data is an array of arrays, with first row being headers.
  // Remove the first header;
  const cleaned = data.slice(1).map((row) => cleanRow(row));
  return res.utils.data(cleaned);
}

router.get(
  '/api/batches/:batchId/statements/:statementId/results',
  mustBeAuthenticated,
  batchToReq,
  wrap(getBatchStatementResults)
);

module.exports = router;
