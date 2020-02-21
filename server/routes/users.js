const router = require('express').Router();
const makeEmail = require('../lib/email');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/sendError');

router.get('/api/users', mustBeAuthenticated, async function(req, res) {
  const { models } = req;
  try {
    const users = await models.users.findAll();
    return res.json({ users });
  } catch (error) {
    sendError(res, error, 'Problem getting uers');
  }
});

// create/whitelist/invite user
router.post('/api/users', mustBeAdmin, async function(req, res) {
  const { models, appLog } = req;
  try {
    let user = await models.users.findOneByEmail(req.body.email);
    if (user) {
      return sendError(res, null, 'User already exists');
    }
    user = await models.users.save({
      email: req.body.email.toLowerCase(),
      role: req.body.role
    });

    const email = makeEmail(req.config);

    if (req.config.smtpConfigured()) {
      email.sendInvite(req.body.email).catch(error => appLog.error(error));
    }
    return res.json({ user });
  } catch (error) {
    sendError(res, error, 'Problem saving user');
  }
});

router.put('/api/users/:_id', mustBeAdmin, async function(req, res) {
  const { params, body, user, models } = req;
  if (user._id === params._id && user.role === 'admin' && body.role != null) {
    return sendError(res, null, "You can't unadmin yourself");
  }
  try {
    const updateUser = await models.users.findOneById(params._id);
    if (!updateUser) {
      return sendError(res, null, 'user not found');
    }
    // this route could handle potentially different kinds of updates
    // only update user properties that are explicitly provided in body
    if (body.role != null) {
      updateUser.role = body.role;
    }
    if (body.passwordResetId != null) {
      updateUser.passwordResetId = body.passwordResetId;
    }
    const updatedUser = await models.users.save(updateUser);
    return res.json({ user: updatedUser });
  } catch (error) {
    sendError(res, error, 'Problem saving user');
  }
});

router.delete('/api/users/:_id', mustBeAdmin, async function(req, res) {
  const { models } = req;
  if (req.user._id === req.params._id) {
    return sendError(res, null, "You can't delete yourself");
  }
  try {
    await models.users.removeById(req.params._id);
    return res.json({});
  } catch (error) {
    sendError(res, error, 'Problem deleting user');
  }
});

module.exports = router;
