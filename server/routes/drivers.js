const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/sendError');
const drivers = require('../drivers');

router.get('/api/drivers', mustBeAuthenticated, function(req, res) {
  const { config } = req;
  const debug = config.get('debug');

  const driversArray = Object.keys(drivers).map(id => {
    return {
      id,
      name: drivers[id].name,
      fields: drivers[id].fields
    };
  });

  try {
    // If debug is turned on show all drivers, otherwise exclude mock driver
    // The mock driver is used for test cases, and is also useful for end-user debugging
    // TODO - deprecate debug for a config to enable mock
    const drivers = driversArray.filter(driver => {
      return debug || driver.id !== 'mock';
    });

    return res.json({ drivers });
  } catch (error) {
    return sendError(res, error, 'Error getting drivers');
  }
});

module.exports = router;
