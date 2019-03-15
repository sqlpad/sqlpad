const assert = require('assert');
const utils = require('../utils');

describe('api/connections', function() {
  let connection;

  before(function() {
    return utils.resetWithUser();
  });

  it('Returns empty array', function() {
    return utils.get('admin', '/api/connections').then(body => {
      assert(!body.error, 'Expect no error');
      assert(Array.isArray(body.connections), 'connections is an array');
      assert.equal(body.connections.length, 0, '0 length');
    });
  });

  it('Creates connection', function() {
    return utils
      .post('admin', '/api/connections', {
        driver: 'postgres',
        name: 'test connection',
        host: 'localhost',
        database: 'testdb',
        username: 'username',
        password: 'password'
      })
      .then(body => {
        assert(!body.error, 'no error');
        assert(body.connection._id, 'has _id');
        assert.equal(body.connection.driver, 'postgres');
        assert.equal(body.connection.username, 'username');
        connection = body.connection;
      });
  });

  it('Gets array of 1', function() {
    return utils
      .get('admin', '/api/connections')
      .then(body => assert.equal(body.connections.length, 1, '0 length'));
  });

  it('Updates connection', function() {
    return utils
      .put('admin', `/api/connections/${connection._id}`, {
        driver: 'postgres',
        name: 'test connection update',
        host: 'localhost',
        database: 'testdb',
        username: 'username',
        password: 'password'
      })
      .then(body => {
        assert(!body.error, 'no error');
        assert(body.connection._id, 'has _id');
        assert.equal(body.connection.name, 'test connection update');
        assert.equal(body.connection.driver, 'postgres');
        assert.equal(body.connection.username, 'username');
      });
  });

  it('Gets updated connection', function() {
    return utils
      .get('admin', `/api/connections/${connection._id}`)
      .then(body => {
        assert(!body.error, 'no error');
        assert.equal(body.connection.name, 'test connection update');
      });
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/connections/${connection._id}`, 302);
  });

  it('Create requires admin', function() {
    return utils.post(
      'editor',
      '/api/connections',
      {
        driver: 'postgres',
        name: 'test connection 2',
        host: 'localhost',
        database: 'testdb',
        username: 'username',
        password: 'password'
      },
      403
    );
  });

  it('Deletes connection', function() {
    return utils
      .del('admin', `/api/connections/${connection._id}`)
      .then(body => assert(!body.error, 'no error'));
  });

  it('Returns empty array', function() {
    return utils.get('admin', '/api/connections').then(body => {
      assert(!body.error, 'Expect no error');
      assert(Array.isArray(body.connections), 'connections is an array');
      assert.equal(body.connections.length, 0, '0 length');
    });
  });
});
