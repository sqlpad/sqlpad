import passport from 'passport';
import getHeaderUser from '../lib/get-header-user.js';
import '../typedefs.js';

/**
 * Middleware to handle passive/sessionless authentication means
 *
 * These kinds of authentications are usually something similar to an API key
 * and do not use the session cookie like other methods.
 * (Google and SAML authenticate with their targets, but still result in a SQLPad user and associated session)
 *
 * @param {Req} req
 * @param {Res} res
 * @param {function} next
 */
function sessionlessAuth(req, res, next) {
  const { config } = req;

  // If the request is already authenticated via something that keeps a session continue
  if (req.isAuthenticated()) {
    return next();
  }

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
    // When called without creating a session, no callback is used
    req.logIn(user, { session: false });
    return next();
  }

  // If auth is disabled, "authenticate" with the custom disable-auth strategy
  // This will stub in a noauth user into the users table, and associate the session accordingly
  if (config.get('authDisabled')) {
    return passport.authenticate('disable-auth', handleAuth)(req, res, next);
  }

  // If authorization header is present, attempt to authenticate based on the type of auth header
  const authHeader = req.get('authorization');
  if (authHeader) {
    // If authorization starts with Bearer and serviceTokenSecret is set,
    // we're going to guess it is a service token jwt
    const serviceTokenSecret = config.get('serviceTokenSecret');
    if (authHeader.startsWith('Bearer ') && serviceTokenSecret) {
      return passport.authenticate('jwt', handleAuth)(req, res, next);
    }

    // If authoriztion starts with Basic and local auth isn't disabled,
    // try HTTP basic authentication
    if (
      authHeader.startsWith('Basic ') &&
      !config.get('userpassAuthDisabled')
    ) {
      return passport.authenticate('basic', handleAuth)(req, res, next);
    }
  }

  // If auth proxy is turned on, try to derive a user from headers
  if (config.get('authProxyEnabled')) {
    const headerUser = getHeaderUser(req);
    if (headerUser) {
      return passport.authenticate('auth-proxy', handleAuth)(req, res, next);
    }
  }

  // None of the passive auth strategies matched, continue on
  // If middleware further down requires auth a response will be sent appropriately
  next();
}

export default sessionlessAuth;
