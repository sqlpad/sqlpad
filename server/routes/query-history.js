const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const getMeta = require('../lib/get-meta');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const urlFilterToNeDbFilter = require('../lib/url-filter-to-nedb-filter');
const wrap = require('../lib/wrap');

// TODO v5 - change this to an array of items?
router.get(
  '/api/query-history',
  mustBeAuthenticated,
  wrap(async function(req, res) {
    const { models } = req;

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

    return res.utils.data(queryHistory);
  })
);

router.get(
  '/api/query-history/:_id',
  mustBeAuthenticated,
  wrap(async function(req, res) {
    const { models } = req;
    const queryHistoryItem = await models.queryHistory.findOneById(
      req.params._id
    );
    if (!queryHistoryItem) {
      return res.utils.notFound();
    }
    return res.utils.data(queryHistoryItem);
  })
);

module.exports = router;
