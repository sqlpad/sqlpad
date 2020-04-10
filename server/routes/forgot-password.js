const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const makeEmail = require('../lib/email');
const wrap = require('../lib/wrap');

router.post(
  '/api/forgot-password',
  wrap(async function(req, res) {
    const { models, appLog } = req;
    if (!req.body.email) {
      return res.errors('Email address must be provided', 400);
    }
    if (!req.config.smtpConfigured()) {
      return res.errors('Email must be configured', 400);
    }

    const email = makeEmail(req.config);

    const user = await models.users.findOneByEmail(req.body.email);

    // If user not found send success regardless
    // This is not a user-validation service
    if (!user) {
      return res.data(null);
    }

    user.passwordResetId = uuidv4();

    await models.users.update(user);

    // Send email, but do not block response
    const resetPath = `/password-reset/${user.passwordResetId}`;
    email
      .sendForgotPassword(req.body.email, resetPath)
      .catch(error => appLog.error(error));

    return res.data(null);
  })
);

module.exports = router;
