const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const drivers = require('../drivers');
const sendError = require('../lib/sendError');

router.get('/api/drivers', mustBeAuthenticated, function(req, res) {
  try {
    return res.json({
      drivers: drivers.getDrivers()
    });
  } catch (error) {
    return sendError(res, error, 'Error getting drivers');
  }
});

module.exports = router;
