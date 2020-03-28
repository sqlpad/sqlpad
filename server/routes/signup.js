const passport = require('passport');
const router = require('express').Router();
const checkWhitelist = require('../lib/check-whitelist');
const sendError = require('../lib/send-error');

async function handleSignup(req, res, next) {
  const { models, config } = req;

  if (config.get('disableUserpassAuth')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const whitelistedDomains = req.config.get('whitelistedDomains');

    if (req.body.password !== req.body.passwordConfirmation) {
      return sendError(res, null, 'Passwords do not match');
    }

    let [user, adminRegistrationOpen] = await Promise.all([
      models.users.findOneByEmail(req.body.email),
      models.users.adminRegistrationOpen()
    ]);

    if (user && user.passhash) {
      return sendError(res, null, 'User already signed up');
    }

    if (user) {
      user.password = req.body.password;
      user.signupDate = new Date();
      await models.users.save(user);
      return next();
    }

    // if open admin registration or whitelisted email create user
    // otherwise exit
    if (
      adminRegistrationOpen ||
      checkWhitelist(whitelistedDomains, req.body.email)
    ) {
      user = await models.users.save({
        email: req.body.email,
        password: req.body.password,
        role: adminRegistrationOpen ? 'admin' : 'editor',
        signupDate: new Date()
      });
      return next();
    } else {
      return sendError(res, null, 'Email address not whitelisted');
    }
  } catch (error) {
    sendError(res, error, 'Error saving user');
  }
}

router.post(
  '/api/signup',
  handleSignup,
  passport.authenticate('local'),
  function(req, res) {
    res.json({});
  }
);

module.exports = router;
