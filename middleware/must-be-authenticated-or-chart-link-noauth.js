const config = require('../lib/config.js')

module.exports = function mustBeAuthenticatedOrChartLinkNoAuth (req, res, next) {
  if (req.isAuthenticated() || !config.get('tableChartLinksRequireAuth')) {
    return next()
  }
  next(new Error('You must be logged in to do that'))
}
