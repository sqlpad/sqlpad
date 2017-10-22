var passport = require('passport')

module.exports = function mustBeAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  passport.authenticate('basic', { session: false })(req, res, next)
  // next(new Error('You must be logged in to do that'))
}
