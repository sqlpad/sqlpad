const router = require('express').Router();
const wrap = require('../lib/wrap');

// This route used to set new password given a passwordResetId
router.post(
  '/api/password-reset/:passwordResetId',
  wrap(async function(req, res) {
    const { models } = req;
    const user = await models.users.findOneByPasswordResetId(
      req.params.passwordResetId
    );

    if (!user) {
      return res.errors('Password reset permissions not found', 404);
    }
    if (req.body.email !== user.email) {
      return res.errors('Incorrect email address', 400);
    }
    if (req.body.password !== req.body.passwordConfirmation) {
      return res.errors('Passwords do not match', 400);
    }
    user.password = req.body.password;
    user.passwordResetId = '';
    await models.users.update(user);
    return res.data(null);
  })
);

module.exports = router;
