import '../typedefs.js';
import passport from 'passport';
import checkAllowedDomains from '../lib/check-allowed-domains.js';
import wrap from '../lib/wrap.js';
import express from 'express';
const router = express.Router();

/**
 * @param {Req} req
 * @param {Res} res
 * @param {Function} next
 */
async function handleSignup(req, res, next) {
  const { models, config, webhooks } = req;

  if (config.get('userpassAuthDisabled')) {
    return res.utils.forbidden();
  }

  const allowedDomains = req.config.get('allowedDomains');

  if (req.body.password !== req.body.passwordConfirmation) {
    return res.utils.error('Passwords do not match');
  }

  let user = await models.users.findOneByEmail(req.body.email);

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

  // if allowed email create user otherwise exit
  if (checkAllowedDomains(allowedDomains, req.body.email)) {
    user = await models.users.create({
      email: req.body.email,
      password: req.body.password,
      role: 'editor',
      signupAt: new Date(),
    });
    webhooks.userCreated(user);
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

export default router;
