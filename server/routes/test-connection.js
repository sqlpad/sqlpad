const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const sendError = require('../lib/send-error');
const ConnectionClient = require('../lib/connection-client');

/**
 * A non-error response is considered a success or valid connection config
 */
router.post('/api/test-connection', mustBeAdmin, async function(req, res) {
  try {
    const connectionClient = new ConnectionClient(req.body, req.user);
    await connectionClient.testConnection();
    res.send({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
