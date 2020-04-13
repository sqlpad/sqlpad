const router = require('express').Router();
const wrap = require('../lib/wrap');

// This route used to set new password given a passwordResetId
// NOTE: This route doesn't fit API REST conventions used elsewhere in app
router.post(
  '/api/password-reset/:passwordResetId',
  wrap(async function(req, res) {
    const { models } = req;
    const user = await models.users.findOneByPasswordResetId(
      req.params.passwordResetId
    );

    if (!user) {
      return res.utils.error('Password reset permissions not found');
    }
    if (req.body.email !== user.email) {
      return res.utils.error('Incorrect email address');
    }
    if (req.body.password !== req.body.passwordConfirmation) {
      return res.utils.error('Passwords do not match');
    }
    user.password = req.body.password;
    user.passwordResetId = '';
    await models.users.update(user);
    return res.utils.data();
  })
);

module.exports = router;
