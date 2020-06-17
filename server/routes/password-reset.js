require('../typedefs');
const router = require('express').Router();
const wrap = require('../lib/wrap');

/**
 * This route used to set new password given a passwordResetId
 * This route doesn't fit API REST conventions used elsewhere in app
 * @param {Req} req
 * @param {Res} res
 */
async function handlePasswordReset(req, res) {
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
  const changes = {
    password: req.body.password,
    passwordResetId: null,
  };
  await models.users.update(user.id, changes);
  return res.utils.data();
}

router.post('/api/password-reset/:passwordResetId', wrap(handlePasswordReset));

module.exports = router;
