const passport = require('passport');

// For actual passport strategy implementations, refer to related route files:
//   Local & Basic:  routes/signup-signin-signout.js
//   Google:         routes/oauth.js
//   SAML:           routes/saml.js
//
// The passport config below applies regardless of the strategy used.

// Given a user object, extract the id to use for session
// nedb objects use `._id`, but some auth implementations at one point used `.id`
passport.serializeUser(function(user, done) {
  done(null, user.id || user._id);
});

// deserializeUser takes the id from the session and turns it into a user object.
// This user object will decorate req.user
// Note: while passport docs only reference this function taking 2 arguments,
// it can take 3, one of which being the req object
// https://github.com/jaredhanson/passport/issues/743
// https://github.com/passport/www.passportjs.org/pull/83/files
passport.deserializeUser(async function(req, id, done) {
  const { models } = req;
  try {
    const user = await models.users.findOneById(id);
    if (user) {
      // decorate req.user with full user object, plus `id` aliased for _id
      return done(null, { ...user, id: user._id });
    }
    done(null, false);
  } catch (error) {
    done(error);
  }
});
