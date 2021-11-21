require('../typedefs');
const { Op } = require('sequelize');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated');
const urlFilterToDbFilter = require('../lib/url-filter-to-db-filter');
const wrap = require('../lib/wrap');

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getHistoryList(req, res) {
  const { models, user } = req;

  // If an editor has no identity (e.g., logged in without authentication), query history is not available because it can not be distinguished from others'.
  if (user.id === 'noauth' && user.role === 'editor') return res.utils.data();

  // Convert URL filter to Sequelize compatible filter object
  const urlFilter = urlFilterToDbFilter(req.query.filter);

  let filter = urlFilter;

  // If not admin, restrict history to logged in user
  if (user.role !== 'admin') {
    filter = {
      [Op.and]: [{ userId: user.id }, urlFilter],
    };
  }

  const dbQueryHistory = await models.queryHistory.findByFilter(filter);
  return res.utils.data(dbQueryHistory);
}

router.get('/api/query-history', mustBeAuthenticated, wrap(getHistoryList));

module.exports = router;
