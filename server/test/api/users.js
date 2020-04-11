const assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const TestUtils = require('../utils');

describe('api/users', function() {
  const utils = new TestUtils();
  let user;

  before(function() {
    return utils.init(true);
  });

  it('Returns initial array', async function() {
    const body = await utils.get('admin', '/api/users');
    assert(Array.isArray(body.data), 'data is an array');
    assert.equal(body.data.length, 3, '3 length');
  });

  it('Creates user', async function() {
    const body = await utils.post('admin', '/api/users', {
      email: 'user1@test.com',
      name: 'user1',
      role: 'editor',
      data: {
        create: true
      }
    });

    user = body.data;

    assert(user._id, 'has id');
    assert.equal(user.email, 'user1@test.com');
    assert.equal(user.name, 'user1');
    assert.equal(user.role, 'editor');
    assert.equal(user.data.create, true);
    assert(user.modifiedDate);
    assert(user.createdDate);
  });

  it('Gets list of users', async function() {
    const body = await utils.get('admin', '/api/users');
    assert.equal(body.data.length, 4, '4 length');
  });

  it('Updates user', async function() {
    const passwordResetId = uuidv4();
    const { data } = await utils.put('admin', `/api/users/${user._id}`, {
      role: 'admin',
      name: 'test',
      passwordResetId,
      data: {
        test: true
      }
    });
    assert.equal(data.role, 'admin');
    assert.equal(data.email, 'user1@test.com');
    assert.equal(data.name, 'test');
    assert.equal(data.passwordResetId, passwordResetId);
    assert.equal(data.data.test, true);
    assert(new Date(data.modifiedDate) > new Date(user.modifiedDate));
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/users`, 401);
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
    const { data } = await utils.del('admin', `/api/users/${user._id}`);
    assert.equal(data, null);
  });

  it('Returns expected list', async function() {
    const body = await utils.get('admin', '/api/users');
    assert.equal(body.data.length, 3, '3 length');
  });
});
