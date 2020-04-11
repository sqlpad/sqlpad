// If authenticated continue, otherwise try with JWT service tokens or
// redirect user to signin
function mustBeAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.utils.errors('Unauthorized', 401);
}

module.exports = mustBeAuthenticated;
