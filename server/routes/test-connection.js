const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const wrap = require('../lib/wrap');
const ConnectionClient = require('../lib/connection-client');

/**
 * A non-error response is considered a success or valid connection config
 */
router.post(
  '/api/test-connection',
  mustBeAdmin,
  wrap(async function(req, res) {
    const connectionClient = new ConnectionClient(req.body, req.user);
    await connectionClient.testConnection();
    res.utils.data();
  })
);

module.exports = router;
