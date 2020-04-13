const assert = require('assert');
const TestUtils = require('../utils');

describe('api/connections', function() {
  const utils = new TestUtils({
    queryResultMaxRows: 800
  });
  let connection;

  before(function() {
    return utils.init(true);
  });

  it('Returns empty array', async function() {
    const body = await utils.get('admin', '/api/connections');
    TestUtils.validateListSuccessBody(body);
    assert.equal(body.length, 0, '0 length');
  });

  it('Creates connection', async function() {
    const body = await utils.post('admin', '/api/connections', {
      driver: 'postgres',
      name: 'test connection',
      host: 'localhost',
      database: 'testdb',
      username: 'username',
      password: 'password'
    });

    assert(body._id, 'has _id');
    assert.equal(body.driver, 'postgres');
    assert.equal(body.username, 'username');
    assert.equal(body.maxRows, 800, 'decorated with maxRows');

    // As of writing this test, only postgres and sqlite connections should have this set to true
    assert.equal(body.supportsConnectionClient, true);

    connection = body;
  });

  it('Gets list of connections', async function() {
    const body = await utils.get('admin', '/api/connections');
    assert.equal(body.length, 1);
    const connection = body[0];

    // supportsConnectionClient expected to be set for list API as well
    assert.equal(connection.supportsConnectionClient, true);
  });

  it('Updates connection', async function() {
    const body = await utils.put(
      'admin',
      `/api/connections/${connection._id}`,
      {
        driver: 'postgres',
        name: 'test connection update',
        host: 'localhost',
        database: 'testdb',
        username: 'username',
        password: 'password'
      }
    );

    assert(body._id, 'has _id');
    assert.equal(body.name, 'test connection update');
    assert.equal(body.driver, 'postgres');
    assert.equal(body.username, 'username');
    assert.equal(body.supportsConnectionClient, true);
    assert.equal(body.maxRows, 800, 'decorated with maxRows');
  });

  it('Gets updated connection', async function() {
    const body = await utils.get('admin', `/api/connections/${connection._id}`);
    assert.equal(body.name, 'test connection update');
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/connections/${connection._id}`, 401);
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

  it('Delete requires admin', async function() {
    await utils.del('editor', `/api/connections/${connection._id}`, 403);
  });

  it('Deletes connection', async function() {
    await utils.del('admin', `/api/connections/${connection._id}`);
    await utils.del('admin', `/api/connections/${connection._id}`, 404);
  });
});
