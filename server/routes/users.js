require('../typedefs');
const router = require('express').Router();
const makeEmail = require('../lib/email');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listUsers(req, res) {
  const { models } = req;
  const users = await models.users.findAll();
  return res.utils.data(users);
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function createUser(req, res) {
  const { models, appLog } = req;

  let user = await models.users.findOneByEmail(req.body.email);
  if (user) {
    return res.utils.error('user already exists');
  }

  // Only accept certain fields
  user = await models.users.create({
    email: req.body.email.toLowerCase(),
    role: req.body.role,
    name: req.body.name,
    data: req.body.data,
  });

  const email = makeEmail(req.config);

  if (req.config.smtpConfigured()) {
    email.sendInvite(req.body.email).catch((error) => appLog.error(error));
  }
  return res.utils.data(user);
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function updateUser(req, res) {
  const { params, body, user, models } = req;
  if (user.id === params.id && user.role === 'admin' && body.role != null) {
    return res.utils.error("You can't unadmin yourself");
  }

  const updateUser = await models.users.findOneById(params.id);
  if (!updateUser) {
    return res.utils.error('user not found');
  }

  // this route could handle potentially different kinds of updates
  // only update user properties that are explicitly allowed to be updated and present
  if (body.role != null) {
    updateUser.role = body.role;
  }
  if (body.passwordResetId != null) {
    updateUser.passwordResetId = body.passwordResetId;
  }
  if (body.name) {
    updateUser.name = body.name;
  }
  if (body.email) {
    updateUser.email = body.email.toLowerCase();
  }
  if (body.data) {
    updateUser.data = body.data;
  }

  const updatedUser = await models.users.update(params.id, updateUser);
  return res.utils.data(updatedUser);
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function deleteUser(req, res) {
  const { models } = req;
  if (req.user.id === req.params.id) {
    return res.utils.error("You can't delete yourself");
  }
  await models.users.removeById(req.params.id);
  return res.utils.data();
}

router.get('/api/users', mustBeAuthenticated, wrap(listUsers));
router.post('/api/users', mustBeAdmin, wrap(createUser));
router.put('/api/users/:id', mustBeAdmin, wrap(updateUser));
router.delete('/api/users/:id', mustBeAdmin, wrap(deleteUser));

module.exports = router;
