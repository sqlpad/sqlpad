import passport from 'passport';
import { Strategy as PassportGoogleStrategy } from 'passport-google-oauth20';
import appLog from '../lib/app-log.js';
import checkAllowedDomains from '../lib/check-allowed-domains.js';

async function passportGoogleStrategyHandler(
  req,
  accessToken,
  refreshToken,
  profile,
  done
) {
  const { models, config, webhooks } = req;
  const email = profile && profile._json && profile._json.email;

  if (!email) {
    return done(null, false, {
      message: 'email not provided from Google',
    });
  }

  try {
    let user = await models.users.findOneByEmail(email);

    if (user) {
      if (user.disabled) {
        return done(null, false);
      }
      user.signupAt = new Date();
      const newUser = await models.users.update(user.id, {
        signupAt: new Date(),
      });
      return done(null, newUser);
    }
    const allowedDomains = config.get('allowedDomains');
    if (checkAllowedDomains(allowedDomains, email)) {
      // Derive what the googleDefaultRole should be from config
      // Value in config could be `editor` or `admin`
      let googleDefaultRole = config
        .get('googleDefaultRole')
        .toLowerCase()
        .trim();

      // @TODO: Consider getting the role from the Google callback?
      // @TODO: Unify the default role handlers across different auth strategies.
      const validRoles = new Set(['editor', 'admin']);
      if (!validRoles.has(googleDefaultRole)) {
        googleDefaultRole = 'editor';
      }

      const newUser = await models.users.create({
        email,
        role: googleDefaultRole,
        signupAt: new Date(),
      });
      webhooks.userCreated(newUser);
      return done(null, newUser);
    }
    // at this point we don't have an error, but authentication is invalid
    // per passport docs, we call done() here without an error
    // instead passing false for user and a message why
    return done(null, false, {
      message: "You haven't been invited by an admin yet.",
    });
  } catch (error) {
    done(error, null);
  }
}

/**
 * Adds Google auth strategy if Google auth is configured
 * @param {object} config
 */
function enableGoogle(config) {
  const baseUrl = config.get('baseUrl');
  const googleClientId = config.get('googleClientId');
  const googleClientSecret = config.get('googleClientSecret');
  const publicUrl = config.get('publicUrl');

  if (config.googleAuthConfigured()) {
    appLog.info('Enabling Google authentication strategy.');
    passport.use(
      new PassportGoogleStrategy(
        {
          passReqToCallback: true,
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: publicUrl + baseUrl + '/auth/google/callback',
          // This option tells the strategy to use the userinfo endpoint instead
          userProfileURL:
            'https://www.googleapis.com/oauth2/v3/userinfo?alt=json',
        },
        passportGoogleStrategyHandler
      )
    );
  }
}

export default enableGoogle;
