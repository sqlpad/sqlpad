const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const urlFilterToDbFilter = require('../lib/url-filter-to-db-filter');
const wrap = require('../lib/wrap');

router.get(
  '/api/query-history',
  mustBeAuthenticated,
  wrap(async function (req, res) {
    const { models } = req;

    // Convert URL filter to Sequelize compatible filter object
    const dbFilter = urlFilterToDbFilter(req.query.filter);
    const dbQueryHistory = await models.queryHistory.findByFilter(dbFilter);

    const rows = dbQueryHistory.map((q) => {
      delete q.id;
      delete q.userId;
      delete q.connectionId;
      return q;
    });

    return res.utils.data(rows);
  })
);

router.get(
  '/api/query-history/:id',
  mustBeAuthenticated,
  wrap(async function (req, res) {
    const { models } = req;
    const queryHistoryItem = await models.queryHistory.findOneById(
      req.params.id
    );
    if (!queryHistoryItem) {
      return res.utils.notFound();
    }
    return res.utils.data(queryHistoryItem);
  })
);

module.exports = router;
