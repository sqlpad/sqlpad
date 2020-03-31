const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/send-error');
const drivers = require('../drivers');

router.get('/api/drivers', mustBeAuthenticated, function(req, res) {
  try {
    const driversArray = Object.keys(drivers).map(id => {
      const supportsConnectionClient = Boolean(drivers[id].Client);
      return {
        id,
        name: drivers[id].name,
        fields: drivers[id].fields,
        supportsConnectionClient
      };
    });
    return res.json({ drivers: driversArray });
  } catch (error) {
    return sendError(res, error, 'Error getting drivers');
  }
});

module.exports = router;
