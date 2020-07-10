require('../typedefs');
const passport = require('passport');
const router = require('express').Router();
const checkAllowedDomains = require('../lib/check-allowed-domains');
const wrap = require('../lib/wrap');

/**
 * @param {Req} req
 * @param {Res} res
 * @param {Function} next
 */
async function handleSignup(req, res, next) {
  const { models, config } = req;

  if (config.get('userpassAuthDisabled') || config.get('disableUserpassAuth')) {
    return res.utils.forbidden();
  }

  const allowedDomains = req.config.get('allowedDomains');

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

  // if open admin registration or allowed email create user
  // otherwise exit
  if (
    adminRegistrationOpen ||
    checkAllowedDomains(allowedDomains, req.body.email)
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
