const mustBeAuthenticated = require('./must-be-authenticated');

module.exports = [
  mustBeAuthenticated,
  function mustBeAdmin(req, res, next) {
    if (req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden' });
  }
];
