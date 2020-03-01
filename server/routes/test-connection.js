const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const sendError = require('../lib/sendError');
const DriverConnection = require('../lib/driver-connection');

/**
 * A non-error response is considered a success or valid connection config
 */
router.post('/api/test-connection', mustBeAdmin, async function(req, res) {
  try {
    const driverConnection = new DriverConnection(req.body, req.user);
    await driverConnection.testConnection();
    res.send({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
