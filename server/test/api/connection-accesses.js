const assert = require('assert');
const utils = require('../utils');

describe('api/connection-accesses', function() {
  let user1;
  let user2;
  let connection1;
  let connection2;
  let connectionAccess1;

  before(async function() {
    await utils.resetWithUser();

    let connBody = await utils.post('admin', '/api/connections', {
      name: 'test connection 1',
      driver: 'mock',
      host: 'localhost',
      database: 'sqlpad',
      username: 'sqlpad',
      password: 'sqlpad'
    });
    connection1 = connBody.connection;

    connBody = await utils.post('admin', '/api/connections', {
      name: 'test connection 2',
      driver: 'mock',
      host: 'localhost',
      database: 'sqlpad',
      username: 'sqlpad',
      password: 'sqlpad'
    });
    connection2 = connBody.connection;

    let userBody = await utils.post('admin', '/api/users', {
      email: 'user1@test.com',
      role: 'editor'
    });
    user1 = userBody.user;

    userBody = await utils.post('admin', '/api/users', {
      email: 'user2@test.com',
      role: 'editor'
    });
    user2 = userBody.user;
  });

  it('Returns empty array', async function() {
    const body = await utils.get('admin', '/api/connection-accesses');
    assert(!body.error, 'Expect no error');
    assert(
      Array.isArray(body.connectionAccesses),
      'connectionAccesses is an array'
    );
    assert.equal(body.connectionAccesses.length, 0, '0 length');
  });

  it('Creates connection accesses', async function() {
    let body = await utils.post('admin', '/api/connection-accesses', {
      connectionId: connection1._id,
      userId: user1._id,
      duration: 3600
    });

    assert(!body.error, 'no error');
    assert(body.connectionAccess._id, 'has _id');
    assert(body.connectionAccess.connectionId, 'has connectionId');
    assert(body.connectionAccess.userId, 'has userId');
    assert.equal(body.connectionAccess.connectionName, 'test connection 1');
    assert.equal(body.connectionAccess.userEmail, 'user1@test.com');
    assert.equal(body.connectionAccess.duration, 3600);
    connectionAccess1 = body.connectionAccess;

    body = await utils.post('admin', '/api/connection-accesses', {
      connectionId: connection2._id,
      userId: user2._id,
      duration: 3600
    });

    assert(!body.error, 'no error');
    assert(body.connectionAccess._id, 'has _id');
    assert(body.connectionAccess.connectionId, 'has connectionId');
    assert(body.connectionAccess.userId, 'has userId');
    assert.equal(body.connectionAccess.connectionName, 'test connection 2');
    assert.equal(body.connectionAccess.userEmail, 'user2@test.com');
    assert.equal(body.connectionAccess.duration, 3600);
  });

  it('Gets array of 2 active accesses', async function() {
    const body = await utils.get('admin', '/api/connection-accesses');
    assert.equal(body.connectionAccesses.length, 2, '2 length');
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/connection-accesses/${connection1._id}`, 302);
  });

  it('Create requires admin', function() {
    return utils.post(
      'editor',
      '/api/connection-accesses',
      {
        connectionId: connection2._id,
        userId: user2._id,
        duration: 3600
      },
      403
    );
  });

  it('Expire requires admin', function() {
    return utils.put(
      'editor',
      `/api/connection-accesses/${connectionAccess1}/expire`,
      {},
      403
    );
  });

  it('Expire active connection', function() {
    return utils.put(
      'admin',
      `/api/connection-accesses/${connectionAccess1._id}/expire`
    );
  });

  it('Gets array of 1 active access ', async function() {
    const body = await utils.get('editor', '/api/connection-accesses');
    assert.equal(body.connectionAccesses.length, 1, '1 length');
  });

  it('Gets array of 2 accesses including inactives', async function() {
    const body = await utils.get(
      'editor',
      '/api/connection-accesses?includeInactives=true'
    );
    assert.equal(body.connectionAccesses.length, 2, '2 length');
  });
});
