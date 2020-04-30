const sqlFormatter = require('sql-formatter');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');

/**
 * Returns formatted query in same object format it was sent
 */
router.post('/api/format-sql', mustBeAuthenticated, function (req, res) {
  const { body } = req;
  if (!body.query) {
    return res.utils.error('query property must be provided');
  }
  const data = {
    query: sqlFormatter.format(body.query),
  };
  res.utils.data(data);
});

module.exports = router;
