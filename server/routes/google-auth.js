require('../typedefs');
const passport = require('passport');
const router = require('express').Router();

/**
 * @param {Req} req
 * @param {Res} res
 * @param {Function} next
 */
function handleGoogleCallback(req, res, next) {
  const baseUrl = req.config.get('baseUrl');
  passport.authenticate('google', {
    successRedirect: baseUrl + '/',
    failureRedirect: baseUrl + '/signin',
  })(req, res, next);
}

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile email'] })
);

router.get('/auth/google/callback', handleGoogleCallback);

module.exports = router;
