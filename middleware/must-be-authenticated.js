module.exports = function mustBeAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  next(new Error('You must be logged in to do that'))
}
