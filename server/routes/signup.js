const passport = require('passport');
const router = require('express').Router();
const checkWhitelist = require('../lib/check-whitelist');
const wrap = require('../lib/wrap');

async function handleSignup(req, res, next) {
  const { models, config } = req;

  if (config.get('disableUserpassAuth')) {
    return res.utils.forbidden();
  }

  const whitelistedDomains = req.config.get('whitelistedDomains');

  if (req.body.password !== req.body.passwordConfirmation) {
    return res.utils.error('Passwords do not match');
  }

  let [user, adminRegistrationOpen] = await Promise.all([
    models.users.findOneByEmail(req.body.email),
    models.users.adminRegistrationOpen(),
  ]);

  if (user && user.passhash) {
    return res.utils.error('User already signed up');
  }

  if (user) {
    await models.users.update(user.id, {
      password: req.body.password,
      signupAt: new Date(),
    });
    return next();
  }

  // if open admin registration or whitelisted email create user
  // otherwise exit
  if (
    adminRegistrationOpen ||
    checkWhitelist(whitelistedDomains, req.body.email)
  ) {
    user = await models.users.create({
      email: req.body.email,
      password: req.body.password,
      role: adminRegistrationOpen ? 'admin' : 'editor',
      signupAt: new Date(),
    });
    return next();
  } else {
    return res.utils.forbidden();
  }
}

router.post(
  '/api/signup',
  wrap(handleSignup),
  passport.authenticate('local'),
  function (req, res) {
    res.utils.data('signup', {});
  }
);

module.exports = router;
