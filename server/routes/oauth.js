const passport = require('passport');
const router = require('express').Router();
const config = require('../lib/config');
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

module.exports = router;
