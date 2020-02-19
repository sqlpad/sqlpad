const passport = require('passport');
const PassportLocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const router = require('express').Router();
const checkWhitelist = require('../lib/check-whitelist');
const usersUtil = require('../models/users.js');
const sendError = require('../lib/sendError');
const config = require('../lib/config');
const logger = require('../lib/logger');
const passhash = require('../lib/passhash.js');

async function handleSignup(req, res, next) {
  try {
    const whitelistedDomains = config.get('whitelistedDomains');

    if (req.body.password !== req.body.passwordConfirmation) {
      return sendError(res, null, 'Passwords do not match');
    }

    let [user, adminRegistrationOpen] = await Promise.all([
      usersUtil.findOneByEmail(req.body.email),
      usersUtil.adminRegistrationOpen()
    ]);

    if (user && user.passhash) {
      return sendError(res, null, 'User already signed up');
    }

    if (user) {
      user.password = req.body.password;
      user.signupDate = new Date();
      await usersUtil.save(user);
      return next();
    }

    // if open admin registration or whitelisted email create user
    // otherwise exit
    if (
      adminRegistrationOpen ||
      checkWhitelist(whitelistedDomains, req.body.email)
    ) {
      user = await usersUtil.save({
        email: req.body.email,
        password: req.body.password,
        role: adminRegistrationOpen ? 'admin' : 'editor',
        signupDate: new Date()
      });
      return next();
    } else {
      return sendError(res, null, 'Email address not whitelisted');
    }
  } catch (error) {
    sendError(res, error, 'Error saving user');
  }
}

function sendSuccess(req, res) {
  res.json({});
}

/*  Some routes should only exist if userpath auth is enabled
============================================================================= */
if (!config.get('disableUserpassAuth')) {
  // Register local auth strategy
  // TODO: Should all authentication strategies be disabled by default, requiring SQLPad implementer to pick one?
  // This might be more secure as it'd prevent SQLPad's from launching with local auth enabled and open admin registration by default
  logger.info('Enabling local authentication strategy.');
  passport.use(
    new PassportLocalStrategy(
      {
        usernameField: 'email'
      },
      async function passportLocalStrategyHandler(email, password, done) {
        try {
          const user = await usersUtil.findOneByEmail(email);
          if (!user) {
            return done(null, false, { message: 'wrong email or password' });
          }
          const isMatch = await passhash.comparePassword(
            password,
            user.passhash
          );
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

  // TODO - basic auth should perhaps be something opted into as a separate config
  logger.info('Enabling basic authentication strategy.');
  passport.use(
    new BasicStrategy(async function(username, password, callback) {
      try {
        const user = await usersUtil.findOneByEmail(username);
        if (!user) {
          return callback(null, false);
        }
        const isMatch = await passhash.comparePassword(password, user.passhash);
        if (!isMatch) {
          return callback(null, false);
        }
        return callback(null, user);
      } catch (error) {
        callback(error);
      }
    })
  );

  // Add routes for local auth signup & signin
  router.post(
    '/api/signup',
    handleSignup,
    passport.authenticate('local'),
    sendSuccess
  );

  router.post('/api/signin', passport.authenticate('local'), sendSuccess);
}

/*  These auth routes should always exist regardless of strategy
============================================================================= */
router.get('/api/signout', function(req, res) {
  if (!req.session) {
    return res.json({});
  }
  req.session.destroy(function(err) {
    if (err) {
      logger.error(err);
    }
    res.json({});
  });
});

module.exports = router;
