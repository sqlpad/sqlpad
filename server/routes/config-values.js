const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const sendError = require('../lib/sendError');

router.post('/api/config-values/:key', mustBeAdmin, async function(req, res) {
  try {
    const { body, config, params } = req;
    await config.save(params.key, body.value);
    res.json({});
  } catch (error) {
    sendError(res, error, 'Problem saving config value');
  }
});

module.exports = router;
