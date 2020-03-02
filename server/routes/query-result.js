const router = require('express').Router();
const mustHaveConnectionAccess = require('../middleware/must-have-connection-access.js');
const mustHaveConnectionAccessOrChartLink = require('../middleware/must-have-connection-access-or-chart-link-noauth');
const sendError = require('../lib/sendError');
const ConnectionClient = require('../lib/connection-client');

// This allows executing a query relying on the saved query text
// Instead of relying on an open endpoint that executes arbitrary sql
router.get(
  '/api/query-result/:_queryId',
  mustHaveConnectionAccessOrChartLink,
  async function(req, res) {
    const { models } = req;
    try {
      const query = await models.queries.findOneById(req.params._queryId);
      if (!query) {
        return sendError(res, null, 'Query not found (save query first)');
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
        return res.send({ queryResult });
      } catch (error) {
        sendError(res, error);
      }
    } catch (error) {
      sendError(res, error, 'Problem querying query database');
    }
  }
);

// Accepts raw inputs from client
// Used during query editing
router.post('/api/query-result', mustHaveConnectionAccess, async function(
  req,
  res
) {
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

  try {
    // TODO - untangle user error from server error
    // An expected result should be sent 200, while unexpected 500
    const queryResult = await getQueryResult(req, data);
    return res.send({ queryResult });
  } catch (error) {
    sendError(res, error);
  }
});

async function getQueryResult(req, data) {
  const { models, config } = req;
  const {
    connectionId,
    clientId,
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

  if (clientId) {
    // get connectionClient by clientId
    // run query
    // TODO
  } else {
    connection.maxRows = Number(config.get('queryResultMaxRows'));
    const connectionClient = new ConnectionClient(connection, user);
    queryResult = await connectionClient.runQuery(queryText);
  }

  queryResult.cacheKey = cacheKey;

  if (config.get('queryHistoryRetentionTimeInDays') > 0) {
    await models.queryHistory.removeOldEntries();
    await models.queryHistory.save({
      userId: user._id,
      userEmail: user.email,
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
