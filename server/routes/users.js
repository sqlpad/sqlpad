require('../typedefs');
const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');

function cleanUser(req, user) {
  if (!user) {
    return user;
  }

  // If admin, remove passhash and return full user object
  if (req.user.role === 'admin') {
    const { passhash, ...rest } = user;
    return rest;
  }

  // Otherwise send back a minimal object
  const { id, name, email, ldapId, role, createdAt, updatedAt } = user;
  return { id, name, email, ldapId, role, createdAt, updatedAt };
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listUsers(req, res) {
  const { models } = req;
  const users = await models.users.findAll();
  const cleaned = users.map((u) => cleanUser(req, u));
  return res.utils.data(cleaned);
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function createUser(req, res) {
  const { models, webhooks, body } = req;

  let user = await models.users.findOneByEmail(body.email);
  if (user) {
    return res.utils.error('user already exists');
  }

  // Only accept certain fields
  user = await models.users.create({
    email: body.email.toLowerCase(),
    ldapId: body.ldapId,
    role: body.role,
    name: body.name,
    data: body.data,
    syncAuthRole: Boolean(body.syncAuthRole),
  });

  webhooks.userCreated(user);

  return res.utils.data(cleanUser(req, user));
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getUser(req, res) {
  const { params, models } = req;
  const foundUser = await models.users.findOneById(params.id);
  return res.utils.data(cleanUser(req, foundUser));
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function updateUser(req, res) {
  const { params, body, user, models } = req;

  // Users can update a subset of themselves
  if (user.id === params.id) {
    const { name, email, password, ...rest } = body;

    if (Object.keys(rest).length > 0) {
      return res.utils.error(
        'Only name, email, and password fields may be updated for self'
      );
    }

    const updatedUser = await models.users.update(params.id, {
      name,
      email,
      password,
    });
    return res.utils.data(cleanUser(req, updatedUser));
  }

  // If user is not updating self, the user doing the update must be an admin
  if (user.role !== 'admin') {
    return res.utils.forbidden();
  }

  const updateUser = await models.users.findOneById(params.id);
  if (!updateUser) {
    return res.utils.error('user not found');
  }

  // this route could handle potentially different kinds of updates
  // only update user properties that are explicitly allowed to be updated and present
  const {
    role,
    passwordResetId,
    name,
    email,
    data,
    disabled,
    syncAuthRole,
    ldapId,
  } = body;

  const update = {
    role,
    passwordResetId,
    name,
    email: typeof email === 'string' ? email.toLowerCase() : email,
    data,
    disabled,
    syncAuthRole,
    ldapId,
  };

  const updatedUser = await models.users.update(params.id, update);
  return res.utils.data(cleanUser(req, updatedUser));
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
router.get('/api/users/:id', mustBeAuthenticated, wrap(getUser));
router.put('/api/users/:id', mustBeAuthenticated, wrap(updateUser));
router.delete('/api/users/:id', mustBeAdmin, wrap(deleteUser));

module.exports = router;
