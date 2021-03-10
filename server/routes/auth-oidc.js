require('../typedefs');
const passport = require('passport');
const router = require('express').Router();

/**
 * @param {Req} req
 * @param {Res} res
 * @param {Function} next
 *
 * Work arounds in here because node-openid-client strategy
 * doesn't do a workaround some strategies do.
 *
 * These workarounds should be fine for both openid-client and passport-openidconnect
 * https://github.com/panva/node-openid-client/issues/146
 * https://github.com/jaredhanson/passport/pull/680
 */
function handleOidcCallback(req, res, next) {
  const baseUrl = req.config.get('baseUrl');

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

  passport.authenticate('oidc', handleAuth)(req, res, next);
}

router.get('/auth/oidc', passport.authenticate('oidc'));
router.get('/auth/oidc/callback', handleOidcCallback);

module.exports = router;
