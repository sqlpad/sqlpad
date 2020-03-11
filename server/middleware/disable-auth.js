module.exports = function(req, res, next) {
  if (req.config.get('disableAuth')) {
  	req.user = {
      id: 'noauth',
      _id: 'noauth',
      role: 'admin',
      email: null
    }
  }
  next();
};