// If authenticated or setting allows it continue. Otherwise redirect user to signin
module.exports = function mustBeAuthenticatedOrChartLink(req, res, next) {
  if (req.isAuthenticated() || !req.config.get('tableChartLinksRequireAuth')) {
    return next();
  }
  res.redirect(req.config.get('baseUrl') + '/signin');
};
