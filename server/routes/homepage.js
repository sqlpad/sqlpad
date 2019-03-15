const router = require('express').Router();
const connections = require('../models/connections.js');
const sendError = require('../lib/sendError');

// TODO FIXME - This was meant to redirect user to appropriate page depending on state of setup
// I do not think it works anymore and should be revisited (this can be done client-side too)
router.get('/', function(req, res) {
  const { config } = req;
  const BASE_URL = config.get('baseUrl');

  return connections
    .findAll()
    .then(docs => {
      if (!req.user) {
        return res.redirect(BASE_URL + '/signin');
      }
      if (docs.length === 0 && req.user.role === 'admin') {
        return res.redirect(BASE_URL + '/connections');
      }
      return res.redirect(BASE_URL + '/queries');
    })
    .catch(error => sendError(res, error));
});

module.exports = router;
