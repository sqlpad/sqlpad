// If authenticated continue. otherwise redirect user to signin
module.exports = function mustBeAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // TODO send 401 instead
  // Sending redirect is old behavior, and signin may not even be available based on auth setup
  res.redirect(req.config.get('baseUrl') + '/signin');
};
