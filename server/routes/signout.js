const router = require('express').Router();
const appLog = require('../lib/app-log');

// Regardless of authentication strategy, signout route should always exist
// It clears out the session which is used regardless of strategy
router.get('/api/signout', function(req, res) {
  if (!req.session) {
    return res.json({});
  }
  req.session.destroy(function(err) {
    if (err) {
      appLog.error(err);
    }
    res.json({});
  });
});

module.exports = router;
