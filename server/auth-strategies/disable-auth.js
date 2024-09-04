import '../typedefs.js';
import passport from 'passport';
import passportCustom from 'passport-custom';
import appLog from '../lib/app-log.js';
const CustomStrategy = passportCustom.Strategy;

function getNoAuthUser(config) {
  const role =
    config.get('authDisabledDefaultRole') === 'admin' ? 'admin' : 'editor';

  return {
    id: 'noauth',
    name: 'noauth',
    role,
    email: 'noauth@example.com',
  };
}

/**
 * A noauth / disableAuth custom strategy
 * When enabled, it always authenticates the request to whatever noauth user is configured
 * Using passport here probably isn't necessary, but it keeps the user/session objects consistent
 * @param {Req} req
 * @param {function} done
 */
async function disableAuthStrategy(req, done) {
  try {
    const { config } = req;
    const noAuthUser = getNoAuthUser(config);
    return done(null, noAuthUser);
  } catch (error) {
    done(error);
  }
}

/**
 * Adds auth proxy strategy if configured
 * Adds a noauth user to users table if it does not yet exist
 * @param {object} config
 * @param {import('../models')} models
 */
async function enableDisableAuth(config, models) {
  if (config.get('authDisabled')) {
    appLog.info('Enabling authDisabled "authentication" strategy.');

    const noAuthUser = getNoAuthUser(config);

    // Try to find existing user in SQLPad's backing db
    // This tries to find a match on both id and email, with id taking priority
    let existingUser = await models.users.findOneById(noAuthUser.id);
    if (!existingUser) {
      await models.users.create(noAuthUser);
    } else if (
      existingUser.name !== noAuthUser.name ||
      existingUser.role !== noAuthUser.role ||
      existingUser.email !== noAuthUser.email
    ) {
      const { id, ...updates } = noAuthUser;
      await models.users.update(id, updates);
    }

    passport.use('disable-auth', new CustomStrategy(disableAuthStrategy));
  }
}

export default enableDisableAuth;
