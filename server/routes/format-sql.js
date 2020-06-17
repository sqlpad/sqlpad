require('../typedefs');
const sqlFormatter = require('sql-formatter');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');

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

module.exports = router;
