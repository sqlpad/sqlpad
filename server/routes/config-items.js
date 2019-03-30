const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');

router.get('/api/config-items', mustBeAdmin, function(req, res) {
  const { config } = req;
  const configItems = config.getConfigItems() || [];
  return res.json({
    configItems: configItems.filter(config => config.interface === 'ui')
  });
});

module.exports = router;
