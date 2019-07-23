const passport = require('passport');
const PassportLocalStrategy = require('passport-local').Strategy;
const PassportGoogleStrategy = require('passport-google-oauth20').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const User = require('../models/User.js');
const configUtil = require('../lib/config');
const checkWhitelist = require('../lib/check-whitelist.js');
const {
  baseUrl,
  googleClientId,
  googleClientSecret,
  publicUrl,
  disableUserpassAuth
} = require('../lib/config').getPreDbConfig();

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findOneById(id);
    if (user) {
      return done(null, {
        id: user._id,
        _id: user._id,
        role: user.role,
        email: user.email
      });
    }
    done(null, false);
  } catch (error) {
    done(error);
  }
});

if (!disableUserpassAuth) {
  passport.use(
    new PassportLocalStrategy(
      {
        usernameField: 'email'
      },
      async function passportLocalStrategyHandler(email, password, done) {
        try {
          const user = await User.findOneByEmail(email);
          if (!user) {
            return done(null, false, { message: 'wrong email or password' });
          }
          const isMatch = await user.comparePasswordToHash(password);
          if (isMatch) {
            return done(null, {
              id: user._id,
              _id: user._id,
              role: user.role,
              email: user.email
            });
          }
          return done(null, false, { message: 'wrong email or password' });
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use(
    new BasicStrategy(async function(username, password, callback) {
      try {
        const user = await User.findOneByEmail(username);
        if (!user) {
          return callback(null, false);
        }
        const isMatch = await user.comparePasswordToHash(password);
        if (!isMatch) {
          return callback(null, false);
        }
        return callback(null, user);
      } catch (error) {
        callback(error);
      }
    })
  );
}

if (googleClientId && googleClientSecret && publicUrl) {
  passport.use(
    new PassportGoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: publicUrl + baseUrl + '/auth/google/callback',
        // This option tells the strategy to use the userinfo endpoint instead
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo?alt=json'
      },
      passportGoogleStrategyHandler
    )
  );
}

async function passportGoogleStrategyHandler(
  accessToken,
  refreshToken,
  profile,
  done
) {
  const email = profile && profile._json && profile._json.email;

  if (!email) {
    return done(null, false, {
      message: 'email not provided from Google'
    });
  }

  try {
    const config = configUtil.getHelper();
    let [openAdminRegistration, user] = await Promise.all([
      User.adminRegistrationOpen(),
      User.findOneByEmail(email)
    ]);

    if (user) {
      user.signupDate = new Date();
      const newUser = await user.save();
      newUser.id = newUser._id;
      return done(null, newUser);
    }
    const whitelistedDomains = config.get('whitelistedDomains');
    if (openAdminRegistration || checkWhitelist(whitelistedDomains, email)) {
      user = new User({
        email,
        role: openAdminRegistration ? 'admin' : 'editor',
        signupDate: new Date()
      });
      const newUser = await user.save();
      newUser.id = newUser._id;
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
