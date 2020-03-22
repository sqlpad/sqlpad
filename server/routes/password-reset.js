const router = require('express').Router();
const sendError = require('../lib/send-error');

// This route used to set new password given a passwordResetId
router.post('/api/password-reset/:passwordResetId', async function(req, res) {
  try {
    const { models } = req;
    const user = await models.users.findOneByPasswordResetId(
      req.params.passwordResetId
    );

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
    await models.users.save(user);
    return res.json({});
  } catch (error) {
    sendError(res, error, 'Problem querying user database');
  }
});

module.exports = router;
