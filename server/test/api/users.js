const assert = require('assert');
const utils = require('../utils');

describe('api/users', function() {
  let user;

  before(function() {
    return utils.resetWithUser();
  });

  it('Returns initial array', function() {
    return utils.get('admin', '/api/users').then(body => {
      assert(!body.error, 'Expect no error');
      assert(Array.isArray(body.users), 'users is an array');
      assert.equal(body.users.length, 2, '2 length');
    });
  });

  it('Creates user', function() {
    return utils
      .post('admin', '/api/users', {
        email: 'user1@test.com',
        role: 'editor'
      })
      .then(body => {
        assert(!body.error, 'no error');
        assert(body.user._id, 'has _id');
        assert.equal(body.user.email, 'user1@test.com');
        user = body.user;
      });
  });

  it('Gets list of users', function() {
    return utils
      .get('admin', '/api/users')
      .then(body => assert.equal(body.users.length, 3, '3 length'));
  });

  it('Updates user', function() {
    return utils
      .put('admin', `/api/users/${user._id}`, {
        role: 'admin'
      })
      .then(body => {
        assert(!body.error, 'no error');
        assert.equal(body.user.role, 'admin');
      });
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

  it('Deletes user', function() {
    return utils
      .del('admin', `/api/users/${user._id}`)
      .then(body => assert(!body.error, 'no error'));
  });

  it('Returns expected list', function() {
    return utils.get('admin', '/api/users').then(body => {
      assert(!body.error, 'Expect no error');
      assert(Array.isArray(body.users), 'users is an array');
      assert.equal(body.users.length, 2, '2 length');
    });
  });
});
