const assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const TestUtils = require('../utils');

describe('api/users', function () {
  const utils = new TestUtils();
  let user;

  before(function () {
    return utils.init(true);
  });

  it('Returns initial array', async function () {
    const body = await utils.get('admin', '/api/users');
    TestUtils.validateListSuccessBody(body);
    assert.equal(body.length, 3, '3 length');
  });

  it('Creates user', async function () {
    user = await utils.post('admin', '/api/users', {
      email: 'user1@test.com',
      name: 'user1',
      role: 'editor',
      data: {
        create: true,
      },
    });

    assert(user.id, 'has id');
    assert.equal(user.email, 'user1@test.com');
    assert.equal(user.name, 'user1');
    assert.equal(user.role, 'editor');
    assert.equal(user.data.create, true);
    assert.equal(user.disabled, null);
    assert(user.updatedAt);
    assert(user.createdAt);
    assert(!user.hasOwnProperty('passhash'));
  });

  it('Gets list of users', async function () {
    const body = await utils.get('admin', '/api/users');
    TestUtils.validateListSuccessBody(body);
    assert.equal(body.length, 4, '4 length');
    const user = body.find((u) => u.email === 'admin@test.com');
    assert.equal(typeof user.id, 'string');
    assert.equal(user.role, 'admin');
    assert(user.hasOwnProperty('name'));
    assert(user.hasOwnProperty('disabled'));
    assert.equal(typeof user.createdAt, 'string');
    assert.equal(typeof user.updatedAt, 'string');
    // passhash and data are sensitive and should not exist
    assert(!user.hasOwnProperty('passhash'));
    assert(!user.hasOwnProperty('data'));
  });

  it('Gets single user', async function () {
    const u = await utils.get('admin', `/api/users/${user.id}`);
    assert.equal(u.email, user.email);
    // passhash should *not* be present
    assert(!u.hasOwnProperty('passhash'));
    // Requires admin access
    await utils.get('editor', `/api/users/${user.id}`, 403);
  });

  it('Updates user', async function () {
    const passwordResetId = uuidv4();
    const body = await utils.put('admin', `/api/users/${user.id}`, {
      role: 'admin',
      name: 'test',
      passwordResetId,
      data: {
        test: true,
      },
    });
    assert.equal(body.role, 'admin');
    assert.equal(body.email, 'user1@test.com');
    assert.equal(body.name, 'test');
    assert.equal(body.passwordResetId, passwordResetId);
    assert.equal(body.data.test, true);
    assert(new Date(body.updatedAt) >= new Date(user.updatedAt));
    assert(!body.hasOwnProperty('passhash'));
  });

  it('Requires authentication', function () {
    return utils.get(null, `/api/users`, 401);
  });

  it('Create requires admin', function () {
    return utils.post(
      'editor',
      '/api/users',
      {
        email: 'user2@test.com',
        role: 'editor',
      },
      403
    );
  });

  it('Deletes user', async function () {
    await utils.del('admin', `/api/users/${user.id}`);
  });

  it('Returns expected list', async function () {
    const body = await utils.get('admin', '/api/users');
    assert.equal(body.length, 3, '3 length');
  });
});
