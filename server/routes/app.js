const router = require('express').Router();
const passport = require('passport');
const version = require('../lib/version.js');
const User = require('../models/User.js');
const sendError = require('../lib/sendError');

// NOTE: this route needs a wildcard because it is fetched as a relative url
// from the front-end. The static SPA does not know if sqlpad is mounted at
// the root of a domain or if there is a base-url provided in the config
router.get('*/api/app', function(req, res) {
  const { config } = req;

  return User.adminRegistrationOpen()
    .then(adminRegistrationOpen => {
      const currentUser =
        req.isAuthenticated() && req.user
          ? {
              _id: req.user.id,
              email: req.user.email,
              role: req.user.role
            }
          : undefined;

      const strategies = Object.keys(passport._strategies).reduce(
        (prev, curr) => {
          prev[curr] = true;
          return prev;
        },
        {}
      );

      res.json({
        adminRegistrationOpen,
        currentUser,
        config: config.getUiConfig(),
        smtpConfigured: config.smtpConfigured(),
        googleAuthConfigured: config.googleAuthConfigured(),
        version: version.get(),
        passport: {
          strategies
        }
      });
    })
    .catch(error => sendError(res, error, 'Problem querying users'));
});

module.exports = router;
