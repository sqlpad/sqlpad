const passport = require('passport');
const router = require('express').Router();
const getHeaderUser = require('../lib/get-header-user');
require('../typedefs');

/**
 * Try to determine the form of login, and authenticate the request
 * Requests calling this route directly will have a session created and a correpsonding cookie
 * This is unlike the more passive sessionless authentication middleware,
 * which will authenticate without starting a session
 * @param {import('express').Request & Req} req
 * @param {object} res
 * @param {function} next
 */
function handleSignin(req, res, next) {
  const { config, body } = req;

  if (body.email && body.password && !config.get('disableUserpassAuth')) {
    return passport.authenticate('local')(req, res, next);
  }

  // If header user is able to be derived from request,
  // authenticate via auth-proxy strategy, saving session
  const headerUser = getHeaderUser(req);
  if (headerUser) {
    return passport.authenticate('auth-proxy')(req, res, next);
  }

  // We aren't sure how to authenticate this request
  // TODO - a more appropriate reponse might be 400 or 401
  return res.status(403).json({ error: 'Forbidden' });
}

router.post('/api/signin', handleSignin, function(req, res) {
  res.json({});
});

module.exports = router;
