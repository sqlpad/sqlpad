// If authenticated continue, otherwise try with JWT service tokens or
// redirect user to signin
function mustBeAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  // TODO send 401 instead
  // Sending redirect is old behavior, and signin may not even be available based on auth setup
  res.redirect(req.config.get('baseUrl') + '/signin');
}

module.exports = mustBeAuthenticated;
