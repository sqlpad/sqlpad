const passport = require('passport');
const router = require('express').Router();
const getHeaderUser = require('../lib/get-header-user');
require('../typedefs');

/**
 * Try to determine the form of login, and authenticate the request
 * Requests calling this route directly will have a session created and a correpsonding cookie
 * This is unlike the more passive sessionless authentication middleware,
 * which will authenticate without starting a session
 * @param {Req} req
 * @param {object} res
 * @param {function} next
 */
function handleSignin(req, res, next) {
  const { config, body } = req;

  /**
   * A custom passport authenticate handler to control shape of response
   * Passport otherwise responds with a 401 when not authenticated
   * To keep this response consistent with other APIs, this formats error accordingly
   * @param {*} err
   * @param {*} user
   * @param {*} info
   */
  function handleAuth(err, user, info) {
    const detail = info && info.message;
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.utils.unauthorized(detail);
    }
    return req.logIn(user, err => {
      if (err) {
        return next(err);
      }
      return res.utils.data();
    });
  }

  if (body.email && body.password && !config.get('disableUserpassAuth')) {
    return passport.authenticate('local', handleAuth)(req, res, next);
  }

  // If header user is able to be derived from request,
  // authenticate via auth-proxy strategy, saving session
  const headerUser = getHeaderUser(req);
  if (headerUser) {
    return passport.authenticate('auth-proxy', handleAuth)(req, res, next);
  }

  // We aren't sure how to authenticate this request
  // Whatever was sent is not supported
  return res.utils.error('Unexpected authentication format');
}

router.post('/api/signin', handleSignin, function(req, res) {
  res.utils.data();
});

module.exports = router;
