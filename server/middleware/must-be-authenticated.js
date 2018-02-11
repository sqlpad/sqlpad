const passport = require('passport')

// If authenticated continue
// If not and auth header is present, try authenticated with http basic
// Otherwise redirect user to signin
module.exports = function mustBeAuthenticated(req, res, next) {
  const { config } = req
  if (req.isAuthenticated()) {
    return next()
  }
  if (req.headers.authorization) {
    return passport.authenticate('basic', { session: false })(req, res, next)
  }
  res.redirect(config.get('baseUrl') + '/signin')
}
