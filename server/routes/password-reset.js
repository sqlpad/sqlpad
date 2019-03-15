const router = require('express').Router();
const User = require('../models/User.js');
const sendError = require('../lib/sendError');

// This route used to set new password given a passwordResetId
router.post('/api/password-reset/:passwordResetId', function(req, res) {
  return User.findOneByPasswordResetId(req.params.passwordResetId)
    .then(user => {
      if (!user) {
        return sendError(res, null, 'Password reset permissions not found');
      }
      if (req.body.email !== user.email) {
        return sendError(res, null, 'Incorrect email address');
      }
      if (req.body.password !== req.body.passwordConfirmation) {
        return sendError(res, null, 'Passwords do not match');
      }
      user.password = req.body.password;
      user.passwordResetId = '';
      return user.save().then(() => res.json({}));
    })
    .catch(error => sendError(res, error, 'Problem querying user database'));
});

module.exports = router;
