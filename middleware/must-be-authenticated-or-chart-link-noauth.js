var passport = require('passport')
const config = require('../lib/config.js')

module.exports = function mustBeAuthenticatedOrChartLinkNoAuth (req, res, next) {
  if (req.isAuthenticated() || !config.get('tableChartLinksRequireAuth')) {
    return next()
  }
  passport.authenticate('basic', { session: false })(req, res, next)
  // next(new Error('You must be logged in to do that'))
}
