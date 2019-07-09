const sanitize = require('sanitize-filename');
const moment = require('moment');
const router = require('express').Router();
const { runQuery } = require('../drivers/index');
const connections = require('../models/connections.js');
const Cache = require('../models/Cache.js');
const Query = require('../models/Query.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const mustBeAuthenticatedOrChartLink = require('../middleware/must-be-authenticated-or-chart-link-noauth.js');
const sendError = require('../lib/sendError');

// This allows executing a query relying on the saved query text
// Instead of relying on an open endpoint that executes arbitrary sql
router.get(
  '/api/query-result/:_queryId',
  mustBeAuthenticatedOrChartLink,
  async function(req, res) {
    try {
      const query = await Query.findOneById(req.params._queryId);
      if (!query) {
        return sendError(res, null, 'Query not found (save query first)');
      }
      const data = {
        connectionId: query.connectionId,
        cacheKey: query._id,
        queryName: query.name,
        queryText: query.queryText,
        config: req.config
      };
      // IMPORTANT: Send actual error here since it might have info on why the query is bad
      try {
        const queryResult = await getQueryResult(data);
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
router.post('/api/query-result', mustBeAuthenticated, async function(req, res) {
  const data = {
    cacheKey: req.body.cacheKey,
    config: req.config,
    connectionId: req.body.connectionId,
    queryName: req.body.queryName,
    queryText: req.body.queryText,
    user: req.user
  };

  try {
    const queryResult = await getQueryResult(data);
    return res.send({ queryResult });
  } catch (error) {
    sendError(res, error);
  }
});

async function getQueryResult(data) {
  const { connectionId, config, cacheKey, queryName, queryText, user } = data;
  const connection = await connections.findOneById(connectionId);

  if (!connection) {
    throw new Error('Please choose a connection');
  }
  connection.maxRows = Number(config.get('queryResultMaxRows'));
  let cache = await Cache.findOneByCacheKey(cacheKey);

  if (!cache) {
    cache = new Cache({ cacheKey });
  }
  cache.queryName = sanitize(
    (queryName || 'SQLPad Query Results') + ' ' + moment().format('YYYY-MM-DD')
  );

  // Expire cache in 8 hours
  const now = new Date();
  cache.expiration = new Date(now.getTime() + 1000 * 60 * 60 * 8);
  const newCache = await cache.save();

  const queryResult = await runQuery(queryText, connection, user);

  queryResult.cacheKey = cacheKey;

  if (config.get('allowCsvDownload')) {
    await newCache.writeXlsx(queryResult);
    await newCache.writeCsv(queryResult);
  }

  return queryResult;
}

module.exports = router;
