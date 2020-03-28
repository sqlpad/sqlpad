const passport = require('passport');
const router = require('express').Router();

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile email'] })
);

router.get('/auth/google/callback', function(req, res, next) {
  const baseUrl = req.config.get('baseUrl');

  passport.authenticate('google', {
    successRedirect: baseUrl + '/',
    failureRedirect: baseUrl + '/signin'
  })(req, res, next);
});

module.exports = router;
