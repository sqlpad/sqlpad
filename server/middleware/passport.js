const passport = require('passport');
const usersUtil = require('../models/users.js');

// For actual passport strategy implementations, refer to related route files:
//   Local & Basic:  routes/signup-signin-signout.js
//   Google:         routes/oauth.js
//   SAML:           routes/saml.js
//
// The passport config below applies regardless of the strategy used.

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await usersUtil.findOneById(id);
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
