const router = require('express').Router();
const uuid = require('uuid');
const makeEmail = require('../lib/email');
const sendError = require('../lib/sendError');

router.post('/api/forgot-password', async function(req, res) {
  const { models, appLog } = req;
  if (!req.body.email) {
    return sendError(res, null, 'Email address must be provided');
  }
  if (!req.config.smtpConfigured()) {
    return sendError(res, null, 'Email must be configured');
  }

  const email = makeEmail(req.config);

  try {
    const user = await models.users.findOneByEmail(req.body.email);

    // If user not found send success regardless
    // This is not a user-validation service
    if (!user) {
      return res.json({});
    }

    user.passwordResetId = uuid.v4();

    await models.users.save(user);

    // Send email, but do not block response
    const resetPath = `/password-reset/${user.passwordResetId}`;
    email
      .sendForgotPassword(req.body.email, resetPath)
      .catch(error => appLog.error(error));

    return res.json({});
  } catch (error) {
    sendError(res, error, 'Problem saving user');
  }
});

module.exports = router;
