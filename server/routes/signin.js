const passport = require('passport');
const router = require('express').Router();

router.post(
  '/api/signin',
  function(req, res, next) {
    const { config } = req;
    if (config.get('disableUserpassAuth')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    passport.authenticate('local')(req, res, next);
  },
  function(req, res) {
    res.json({});
  }
);

module.exports = router;
