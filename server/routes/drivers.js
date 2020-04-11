const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const drivers = require('../drivers');

router.get('/api/drivers', mustBeAuthenticated, function(req, res) {
  const driversArray = Object.keys(drivers).map(id => {
    const supportsConnectionClient = Boolean(drivers[id].Client);
    return {
      id,
      name: drivers[id].name,
      fields: drivers[id].fields,
      supportsConnectionClient
    };
  });
  return res.utils.data(driversArray);
});

module.exports = router;
