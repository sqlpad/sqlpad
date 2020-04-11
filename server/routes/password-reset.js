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
      return res.utils.errors('Password reset permissions not found', 400);
    }
    if (req.body.email !== user.email) {
      return res.utils.errors('Incorrect email address', 400);
    }
    if (req.body.password !== req.body.passwordConfirmation) {
      return res.utils.errors('Passwords do not match', 400);
    }
    user.password = req.body.password;
    user.passwordResetId = '';
    await models.users.update(user);
    return res.utils.data(null);
  })
);

module.exports = router;
