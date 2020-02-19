const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const router = require('express').Router();
const logger = require('../lib/logger');
const usersUtil = require('../models/users.js');

/**
 * Adds passport SAML strategy and SAML auth routes if SAML is configured
 * @param {object} config
 */
function makeSamlAuth(config) {
  const samlEntryPoint = config.get('samlEntryPoint');
  const samlIssuer = config.get('samlIssuer');
  const samlCallbackUrl = config.get('samlCallbackUrl');
  const samlCert = config.get('samlCert');
  const samlAuthContext = config.get('samlAuthContext');

  if (
    samlEntryPoint &&
    samlIssuer &&
    samlCallbackUrl &&
    samlCert &&
    samlAuthContext
  ) {
    logger.info('Enabling SAML authentication strategy.');

    // Register SAML strategy
    passport.use(
      new SamlStrategy(
        {
          path: '/login/callback',
          entryPoint: samlEntryPoint,
          issuer: samlIssuer,
          callbackUrl: samlCallbackUrl,
          cert: samlCert,
          authnContext: samlAuthContext,
          identifierFormat: null
        },
        async function(p, done) {
          const email =
            p[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
            ];
          const user = await usersUtil.findOneByEmail(email);
          logger.info('User logged in via SAML %s', email);
          if (!user) {
            return done(null, false);
          }
          return done(null, {
            id: user._id,
            _id: user._id,
            role: user.role,
            email: user.email
          });
        }
      )
    );

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
