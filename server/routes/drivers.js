const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const driversUtil = require('../drivers');
const sendError = require('../lib/sendError');

router.get('/api/drivers', mustBeAuthenticated, function(req, res) {
  const { config } = req;
  const debug = config.get('debug');

  try {
    // If debug is turned on show all drivers, otherwise exclude mock driver
    // The mock driver is used for test cases, and is also useful for end-user debugging
    // TODO - deprecate debug for a config to enable mock
    const drivers = driversUtil.getDrivers().filter(driver => {
      return debug || driver.id !== 'mock';
    });

    return res.json({ drivers });
  } catch (error) {
    return sendError(res, error, 'Error getting drivers');
  }
});

module.exports = router;
