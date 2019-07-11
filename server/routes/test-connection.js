const router = require('express').Router();
const { testConnection } = require('../drivers/index');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const sendError = require('../lib/sendError');

/**
 * A non-error response is considered a success or valid connection config
 */
router.post('/api/test-connection', mustBeAdmin, async function(req, res) {
  const { body } = req;
  try {
    await testConnection(body);
    res.send({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
