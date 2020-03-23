const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const express = require('express');
const appLog = require('../lib/app-log');

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

  const router = express.Router();

  if (
    samlEntryPoint &&
    samlIssuer &&
    samlCallbackUrl &&
    samlCert &&
    samlAuthContext
  ) {
    appLog.info('Enabling SAML authentication strategy.');

    // Register SAML strategy
    passport.use(
      new SamlStrategy(
        {
          passReqToCallback: true,
          path: '/login/callback',
          entryPoint: samlEntryPoint,
          issuer: samlIssuer,
          callbackUrl: samlCallbackUrl,
          cert: samlCert,
          authnContext: samlAuthContext,
          identifierFormat: null
        },
        async function(req, p, done) {
          const email =
            p[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
            ];
          const { models } = req;
          const user = await models.users.findOneByEmail(email);
          appLog.info('User logged in via SAML %s', email);
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
