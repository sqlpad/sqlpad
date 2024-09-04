import '../typedefs.js';
import sqlFormatter from 'sql-formatter';
import mustBeAuthenticated from '../middleware/must-be-authenticated.js';
import express from 'express';
const router = express.Router();

/**
 * Returns formatted query in same object format it was sent
 * @param {Req} req
 * @param {Res} res
 */
function formatSql(req, res) {
  const { body } = req;
  if (!body.query) {
    return res.utils.error('query property must be provided');
  }
  const data = {
    query: sqlFormatter.format(body.query),
  };
  res.utils.data(data);
}

router.post('/api/format-sql', mustBeAuthenticated, formatSql);

export default router;
