const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const getMeta = require('../lib/getMeta');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const urlFilterToNeDbFilter = require('../lib/urlFilterToNeDbFilter');
const sendError = require('../lib/sendError');

router.get('/api/query-history', mustBeAuthenticated, async function(req, res) {
  const { models } = req;
  try {
    const queryHistory = {
      id: uuidv4(),
      cacheKey: null,
      startTime: new Date(),
      stopTime: null,
      queryRunTime: null,
      fields: [],
      incomplete: false,
      meta: {},
      rows: []
    };

    // Convert URL filter to NeDB compatible filter object
    const dbFilter = urlFilterToNeDbFilter(req.query.filter);
    const dbQueryHistory = await models.queryHistory.findByFilter(dbFilter);

    dbQueryHistory.map(q => {
      delete q._id;
      delete q.userId;
      delete q.connectionId;
      return q;
    });

    queryHistory.incomplete =
      dbQueryHistory.length >= req.config.get('queryHistoryResultMaxRows');
    queryHistory.rows = dbQueryHistory;
    queryHistory.stopTime = new Date();
    queryHistory.queryRunTime =
      dbQueryHistory.stopTime - dbQueryHistory.startTime;
    queryHistory.meta = getMeta(dbQueryHistory);
    queryHistory.fields = Object.keys(queryHistory.meta);

    return res.json({ queryHistory });
  } catch (error) {
    sendError(res, error, error.message);
  }
});

router.get('/api/query-history/:_id', mustBeAuthenticated, async function(
  req,
  res
) {
  const { models } = req;
  try {
    const queryHistoryItem = await models.queryHistory.findOneById(
      req.params._id
    );
    if (!queryHistoryItem) {
      return sendError(res, null, 'Query history item not found');
    }
    return res.json({ queryHistoryItem });
  } catch (error) {
    sendError(res, error, 'Problem querying query history database');
  }
});

module.exports = router;
