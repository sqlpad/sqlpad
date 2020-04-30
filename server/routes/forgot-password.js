const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const makeEmail = require('../lib/email');
const wrap = require('../lib/wrap');

router.post(
  '/api/forgot-password',
  wrap(async function (req, res) {
    const { models, appLog } = req;
    if (!req.body.email) {
      return res.utils.error('Email address must be provided');
    }
    if (!req.config.smtpConfigured()) {
      return res.utils.error('Email must be configured');
    }

    const email = makeEmail(req.config);

    const user = await models.users.findOneByEmail(req.body.email);

    // If user not found send success regardless
    // This is not a user-validation service
    if (!user) {
      return res.utils.data();
    }

    const passwordResetId = uuidv4();

    await models.users.update(user.id, { passwordResetId });

    // Send email, but do not block response
    const resetPath = `/password-reset/${passwordResetId}`;
    email
      .sendForgotPassword(req.body.email, resetPath)
      .catch((error) => appLog.error(error));

    return res.utils.data();
  })
);

module.exports = router;
