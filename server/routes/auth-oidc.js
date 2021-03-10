require('../typedefs');
const passport = require('passport');
const router = require('express').Router();

/**
 * @param {Req} req
 * @param {Res} res
 * @param {Function} next
 *
 * Work arounds in here because node-openid-client strategy
 * suffers from a race condition of sorts in passport
 *
 * These workarounds should be fine for both openid-client and passport-openidconnect
 * https://github.com/panva/node-openid-client/issues/146
 * https://github.com/jaredhanson/passport/pull/680
 */
function handleOidcCallback(req, res, next) {
  const { config } = req;
  const baseUrl = config.get('baseUrl');

  function redirectUser(err, user) {
    if (err) {
      res.redirect(`${baseUrl}/signin`);
    }
    if (!user) {
      res.redirect(`${baseUrl}/signin`);
    }
    return req.logIn(user, (err) => {
      if (err) {
        res.redirect(`${baseUrl}/signin`);
      }
      res.redirect(`${baseUrl}`);
    });
  }

  /**
   * A custom passport authenticate handler to save session before redirect
   * @param {*} err
   * @param {*} user
   * @param {*} info
   */
  function handleAuth(err, user) {
    if (err) {
      return redirectUser(err, user);
    }
    if (req.session && typeof req.session.save === 'function') {
      return req.session.save((err) => {
        redirectUser(err, user);
      });
    }
    return redirectUser(err, user);
  }

  // If legacy oidc is configured authenticate with that mechanism
  // Otherwise use oidc implementation based on openid-client
  if (config.oidcLegacyConfigured()) {
    return passport.authenticate('oidc-legacy', handleAuth)(req, res, next);
  }
  return passport.authenticate('oidc', handleAuth)(req, res, next);
}

router.get('/auth/oidc', (req, res, next) => {
  const { config } = req;
  // If legacy oidc is configured authenticate with that mechanism
  // Otherwise use oidc implementation based on openid-client
  if (config.oidcLegacyConfigured()) {
    return passport.authenticate('oidc-legacy')(req, res, next);
  }
  return passport.authenticate('oidc')(req, res, next);
});

router.get('/auth/oidc/callback', handleOidcCallback);

module.exports = router;
