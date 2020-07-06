require('../typedefs');
const passport = require('passport');
const router = require('express').Router();

/**
 * @param {Req} req
 * @param {Res} res
 * @param {Function} next
 */
function handleOidcCallback(req, res, next) {
  const baseUrl = req.config.get('baseUrl');
  passport.authenticate('oidc', {
    successRedirect: baseUrl + '/',
    failureRedirect: baseUrl + '/signin',
  })(req, res, next);
}

router.get('/auth/oidc', passport.authenticate('oidc'));
router.get('/auth/oidc/callback', handleOidcCallback);

module.exports = router;
