const sqlFormatter = require('sql-formatter');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/send-error');

/**
 * Returns formatted query in same object format it was sent
 */
router.post('/api/format-sql', mustBeAuthenticated, function(req, res) {
  const { body } = req;
  if (!body.query) {
    return sendError(res, null, 'query property must be provided');
  }
  body.query = sqlFormatter.format(body.query);
  res.send(body);
});

module.exports = router;
