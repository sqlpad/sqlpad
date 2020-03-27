const passport = require('passport');
const express = require('express');

/**
 * Adds Google oauth routes if Google auth is configured
 * @param {object} config
 */
function makeGoogleAuth(config) {
  const router = express.Router();

  if (config.googleAuthConfigured()) {
    const baseUrl = config.get('baseUrl');

    router.get(
      '/auth/google',
      passport.authenticate('google', { scope: ['profile email'] })
    );

    router.get(
      '/auth/google/callback',
      passport.authenticate('google', {
        successRedirect: baseUrl + '/',
        failureRedirect: baseUrl + '/signin'
      })
    );
  }

  return router;
}

module.exports = makeGoogleAuth;
