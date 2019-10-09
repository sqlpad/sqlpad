const router = require('express').Router();
const usersUtil = require('../models/users.js');
const email = require('../lib/email');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/sendError');
const config = require('../lib/config');

router.get('/api/users', mustBeAuthenticated, async function(req, res) {
  try {
    const users = await usersUtil.findAll();
    return res.json({ users });
  } catch (error) {
    sendError(res, error, 'Problem getting uers');
  }
});

// create/whitelist/invite user
router.post('/api/users', mustBeAdmin, async function(req, res) {
  try {
    let user = await usersUtil.findOneByEmail(req.body.email);
    if (user) {
      return sendError(res, null, 'User already exists');
    }
    user = await usersUtil.save({
      email: req.body.email.toLowerCase(),
      role: req.body.role
    });

    if (config.smtpConfigured()) {
      email.sendInvite(req.body.email).catch(error => console.error(error));
    }
    return res.json({ user });
  } catch (error) {
    sendError(res, error, 'Problem saving user');
  }
});

router.put('/api/users/:_id', mustBeAdmin, async function(req, res) {
  const { params, body, user } = req;
  if (user._id === params._id && user.role === 'admin' && body.role != null) {
    return sendError(res, null, "You can't unadmin yourself");
  }
  try {
    const updateUser = await usersUtil.findOneById(params._id);
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
    const updatedUser = await usersUtil.save(updateUser);
    return res.json({ user: updatedUser });
  } catch (error) {
    sendError(res, error, 'Problem saving user');
  }
});

router.delete('/api/users/:_id', mustBeAdmin, async function(req, res) {
  if (req.user._id === req.params._id) {
    return sendError(res, null, "You can't delete yourself");
  }
  try {
    await usersUtil.removeById(req.params._id);
    return res.json({});
  } catch (error) {
    sendError(res, error, 'Problem deleting user');
  }
});

module.exports = router;
