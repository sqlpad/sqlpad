const assert = require('assert');
const TestUtils = require('../utils');

describe('api/users', function() {
  const utils = new TestUtils();
  let user;

  before(function() {
    return utils.init(true);
  });

  it('Returns initial array', async function() {
    const body = await utils.get('admin', '/api/users');
    assert(!body.error, 'Expect no error');
    assert(Array.isArray(body.users), 'users is an array');
    assert.equal(body.users.length, 3, '3 length');
  });

  it('Creates user', async function() {
    const body = await utils.post('admin', '/api/users', {
      email: 'user1@test.com',
      role: 'editor'
    });

    assert(!body.error, 'no error');
    assert(body.user._id, 'has _id');
    assert.equal(body.user.email, 'user1@test.com');
    user = body.user;
  });

  it('Gets list of users', async function() {
    const body = await utils.get('admin', '/api/users');
    assert.equal(body.users.length, 4, '4 length');
  });

  it('Updates user', async function() {
    const body = await utils.put('admin', `/api/users/${user._id}`, {
      role: 'admin'
    });
    assert(!body.error, 'no error');
    assert.equal(body.user.role, 'admin');
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/users`, 302);
  });

  it('Create requires admin', function() {
    return utils.post(
      'editor',
      '/api/users',
      {
        email: 'user2@test.com',
        role: 'editor'
      },
      403
    );
  });

  it('Deletes user', async function() {
    const body = await utils.del('admin', `/api/users/${user._id}`);
    assert(!body.error, 'no error');
  });

  it('Returns expected list', async function() {
    const body = await utils.get('admin', '/api/users');
    assert(!body.error, 'Expect no error');
    assert(Array.isArray(body.users), 'users is an array');
    assert.equal(body.users.length, 3, '3 length');
  });
});
