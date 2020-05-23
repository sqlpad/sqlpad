require('../typedefs');
const router = require('express').Router();
const mustHaveConnectionAccess = require('../middleware/must-have-connection-access.js');
const executeBatch = require('../lib/execute-batch');
const wrap = require('../lib/wrap');

// This allows executing a query relying on the saved query text
// Instead of relying on an open endpoint that executes arbitrary sql
router.get(
  '/api/query-result/:_queryId',
  wrap(async function (req, res) {
    const { models, user } = req;
    const query = await models.queries.findOneById(req.params._queryId);
    if (!query) {
      return res.utils.notFound();
    }

    if (!user) {
      return res.utils.unauthorized();
    }

    // Inline connection access since connectionId is not  part of body or params
    // Admins are exempt from this check
    if (user.role !== 'admin') {
      const connectionAccess = await models.connectionAccesses.findOneActiveByConnectionIdAndUserId(
        query.connectionId,
        user.id
      );
      if (!connectionAccess) {
        return res.utils.forbidden();
      }
    }

    const data = {
      connectionId: query.connectionId,
      queryId: query.id,
      queryName: query.name,
      queryText: query.queryText,
      user: req.user,
    };
    // IMPORTANT: Send actual error here since it might have info on why the query is bad
    try {
      const queryResult = await getQueryResult(req, data);
      return res.utils.data(queryResult);
    } catch (error) {
      return res.utils.error(error);
    }
  })
);

// Accepts raw inputs from client
// Used during query editing
router.post(
  '/api/query-result',
  mustHaveConnectionAccess,
  wrap(async function (req, res) {
    const { body, user } = req;

    const data = {
      connectionId: body.connectionId,
      queryId: body.queryId,
      queryName: body.queryName,
      queryText: body.queryText,
      connectionClientId: body.connectionClientId,
      user,
    };

    // IMPORTANT: Send actual error here since it might have info on why the query is bad
    // TODO untangle user error from server error.
    // Unexpected server error should be 500 Should a query error be 200 or 400?
    try {
      const queryResult = await getQueryResult(req, data);
      return res.utils.data(queryResult);
    } catch (error) {
      return res.utils.error(error);
    }
  })
);

/**
 * @param {Req} req
 * @param {object} data
 */
async function getQueryResult(req, data) {
  const { models, config } = req;
  const {
    connectionId,
    connectionClientId,
    queryId,
    queryName,
    queryText,
    user,
  } = data;

  const connection = await models.connections.findOneById(connectionId);

  if (!connection) {
    throw new Error('Please choose a connection');
  }

  const batchData = {
    queryId,
    name: queryName,
    connectionId,
    connectionClientId,
    batchText: queryText,
    selectedText: queryText,
    userId: user.id,
  };

  const batch = await models.batches.create(batchData);
  const queryResult = await executeBatch(models, batch.id);

  if (config.get('queryHistoryRetentionTimeInDays') > 0) {
    await models.queryHistory.save({
      userId: user ? user.id : 'unauthenticated link',
      userEmail: user ? user.email : 'anauthenticated link',
      connectionId: connection.id,
      connectionName: connection.name,
      startTime: queryResult.startTime,
      stopTime: queryResult.stopTime,
      queryRunTime: queryResult.queryRunTime,
      queryId,
      queryName,
      queryText,
      incomplete: queryResult.incomplete,
      rowCount: queryResult.rows.length,
    });
  }

  return queryResult;
}

module.exports = router;
