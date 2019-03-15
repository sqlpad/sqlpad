const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const sendError = require('../lib/sendError');

router.post('/api/config-values/:key', mustBeAdmin, function(req, res) {
  const { body, config, params } = req;
  config
    .save(params.key, body.value)
    .then(() => res.json({}))
    .catch(error => sendError(res, error, 'Problem saving config value'));
});

module.exports = router;
