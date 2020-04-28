const passport = require('passport');
const PassportGoogleStrategy = require('passport-google-oauth20').Strategy;
const appLog = require('../lib/app-log');
const checkWhitelist = require('../lib/check-whitelist.js');

async function passportGoogleStrategyHandler(
  req,
  accessToken,
  refreshToken,
  profile,
  done
) {
  const { models, config } = req;
  const email = profile && profile._json && profile._json.email;

  if (!email) {
    return done(null, false, {
      message: 'email not provided from Google'
    });
  }

  try {
    let [openAdminRegistration, user] = await Promise.all([
      models.users.adminRegistrationOpen(),
      models.users.findOneByEmail(email)
    ]);

    if (user) {
      user.signupAt = new Date();
      const newUser = await models.users.update(user.id, {
        signupAt: new Date()
      });
      return done(null, newUser);
    }
    const whitelistedDomains = config.get('whitelistedDomains');
    if (openAdminRegistration || checkWhitelist(whitelistedDomains, email)) {
      const newUser = await models.users.create({
        email,
        role: openAdminRegistration ? 'admin' : 'editor',
        signupAt: new Date()
      });
      return done(null, newUser);
    }
    // at this point we don't have an error, but authentication is invalid
    // per passport docs, we call done() here without an error
    // instead passing false for user and a message why
    return done(null, false, {
      message: "You haven't been invited by an admin yet."
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
            'https://www.googleapis.com/oauth2/v3/userinfo?alt=json'
        },
        passportGoogleStrategyHandler
      )
    );
  }
}

module.exports = enableGoogle;
