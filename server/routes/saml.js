const passport = require('passport');
const express = require('express');

/**
 * Adds SAML auth routes if SAML is configured
 * @param {object} config
 */
function makeSamlAuth(config) {
  const router = express.Router();

  if (config.samlAuthConfigured()) {
    // Add SAML auth routes
    router.post(
      '/login/callback',
      passport.authenticate('saml', {
        failureRedirect: '/',
        failureFlash: true
      }),
      function(req, res) {
        res.redirect('/');
      }
    );

    router.get(
      '/auth/saml',
      passport.authenticate('saml', {
        failureRedirect: '/',
        failureFlash: true
      }),
      function(req, res) {
        res.redirect('/');
      }
    );
  }

  return router;
}

module.exports = makeSamlAuth;
