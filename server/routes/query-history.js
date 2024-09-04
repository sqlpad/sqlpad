import '../typedefs.js';
import { Op } from 'sequelize';
import mustBeAuthenticated from '../middleware/must-be-authenticated.js';
import urlFilterToDbFilter from '../lib/url-filter-to-db-filter.js';
import wrap from '../lib/wrap.js';
import express from 'express';
const router = express.Router();

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

export default router;
