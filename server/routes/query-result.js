require('../typedefs');
const router = require('express').Router();
const mustHaveConnectionAccess = require('../middleware/must-have-connection-access.js');
const ConnectionClient = require('../lib/connection-client');
const wrap = require('../lib/wrap');

// This allows executing a query relying on the saved query text
// Instead of relying on an open endpoint that executes arbitrary sql
router.get(
  '/api/query-result/:_queryId',
  mustHaveConnectionAccess,
  wrap(async function(req, res) {
    const { models } = req;
    const query = await models.queries.findOneById(req.params._queryId);
    if (!query) {
      return res.utils.notFound();
    }
    const data = {
      connectionId: query.connectionId,
      cacheKey: query._id,
      queryId: query._id,
      queryName: query.name,
      queryText: query.queryText,
      user: req.user
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
  wrap(async function(req, res) {
    const { body, user } = req;

    const data = {
      cacheKey: body.cacheKey,
      connectionId: body.connectionId,
      queryId: body.queryId,
      queryName: body.queryName,
      queryText: body.queryText,
      connectionClientId: body.connectionClientId,
      user
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
    cacheKey,
    queryId,
    queryName,
    queryText,
    user
  } = data;

  let queryResult;

  const connection = await models.connections.findOneById(connectionId);

  if (!connection) {
    throw new Error('Please choose a connection');
  }

  if (connectionClientId) {
    const connectionClient = models.connectionClients.getOneById(
      connectionClientId
    );
    if (!connectionClient) {
      throw new Error('Connection client disconnected');
    }
    queryResult = await connectionClient.runQuery(queryText);
  } else {
    const connectionClient = new ConnectionClient(connection, user);
    queryResult = await connectionClient.runQuery(queryText);
  }

  queryResult.cacheKey = cacheKey;

  if (config.get('queryHistoryRetentionTimeInDays') > 0) {
    await models.queryHistory.removeOldEntries();
    await models.queryHistory.save({
      userId: user ? user._id : 'unauthenticated link',
      userEmail: user ? user.email : 'anauthenticated link',
      connectionId: connection._id,
      connectionName: connection.name,
      startTime: queryResult.startTime,
      stopTime: queryResult.stopTime,
      queryRunTime: queryResult.queryRunTime,
      queryId,
      queryName,
      queryText,
      incomplete: queryResult.incomplete,
      rowCount: queryResult.rows.length
    });
  }

  if (config.get('allowCsvDownload')) {
    models.resultCache.saveResultCache(cacheKey, queryName);
    await models.resultCache.writeXlsx(cacheKey, queryResult);
    await models.resultCache.writeCsv(cacheKey, queryResult);
    await models.resultCache.writeJson(cacheKey, queryResult);
  }

  return queryResult;
}

module.exports = router;
