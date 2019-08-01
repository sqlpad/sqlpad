const passport = require('passport');
const router = require('express').Router();
const checkWhitelist = require('../lib/check-whitelist');
const User = require('../models/User.js');
const sendError = require('../lib/sendError');
const config = require('../lib/config');

async function handleSignup(req, res, next) {
  try {
    const whitelistedDomains = config.get('whitelistedDomains');

    if (req.body.password !== req.body.passwordConfirmation) {
      return sendError(res, null, 'Passwords do not match');
    }

    let [user, adminRegistrationOpen] = await Promise.all([
      User.findOneByEmail(req.body.email),
      User.adminRegistrationOpen()
    ]);

    if (user && user.passhash) {
      return sendError(res, null, 'User already signed up');
    }
    if (user) {
      user.password = req.body.password;
      user.signupDate = new Date();
    }
    if (!user) {
      // if open admin registration or whitelisted email create user
      // otherwise exit
      if (
        adminRegistrationOpen ||
        checkWhitelist(whitelistedDomains, req.body.email)
      ) {
        user = new User({
          email: req.body.email,
          password: req.body.password,
          role: adminRegistrationOpen ? 'admin' : 'editor',
          signupDate: new Date()
        });
      } else {
        return sendError(res, null, 'Email address not whitelisted');
      }
    }
    await user.save();
    next();
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
      console.error(err);
    }
    res.json({});
  });
});

module.exports = router;
