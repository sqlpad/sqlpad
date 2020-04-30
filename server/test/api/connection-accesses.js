const assert = require('assert');
const TestUtils = require('../utils');
const consts = require('../../lib/consts');

describe('api/connection-accesses', function () {
  const utils = new TestUtils();
  let admin2;
  let user1;
  let user2;
  let connection1;
  let connection2;
  let defeaultConnectionAccess;
  let connectionAccess1;

  before(async function () {
    await utils.init(true);

    connection1 = await utils.post('admin', '/api/connections', {
      name: 'test connection 1',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite',
    });

    connection2 = await utils.post('admin', '/api/connections', {
      name: 'test connection 2',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite',
    });

    admin2 = await utils.post('admin', '/api/users', {
      email: 'admin2@test.com',
      role: 'admin',
    });

    user1 = await utils.post('admin', '/api/users', {
      email: 'user1@test.com',
      role: 'editor',
    });

    user2 = await utils.post('admin', '/api/users', {
      email: 'user2@test.com',
      role: 'editor',
    });
  });

  it('Get default connection accesses', async function () {
    const body = await utils.get('admin', '/api/connection-accesses');
    TestUtils.validateListSuccessBody(body);
    assert.equal(body.length, 1, '1 length');
    assert(body[0].id, 'has id');
    assert.equal(body[0].connectionId, consts.EVERY_CONNECTION_ID);
    assert.equal(body[0].connectionName, consts.EVERY_CONNECTION_NAME);
    assert.equal(body[0].userId, consts.EVERYONE_ID);
    assert.equal(body[0].userName, consts.EVERYONE_NAME);
    assert.equal(body[0].duration, 0);
    assert.equal(new Date(body[0].expiryDate).getFullYear(), 2099);
    defeaultConnectionAccess = body[0];
  });

  it('Detect default active connection when creating new access', async function () {
    const body = await utils.post(
      'admin',
      '/api/connection-accesses',
      {
        connectionId: connection1.id,
        userId: user1.id,
        duration: 3600,
      },
      400
    );

    assert.equal(body.title, 'User has active access to connection');
  });

  it('Expire default access on every connection to every user', function () {
    return utils.put(
      'admin',
      `/api/connection-accesses/${defeaultConnectionAccess.id}/expire`
    );
  });

  it('Returns empty array', async function () {
    const body = await utils.get('admin', '/api/connection-accesses');
    TestUtils.validateListSuccessBody(body);
    assert.equal(body.length, 0, '0 length');
  });

  it('Do not create access for admin', async function () {
    const body = await utils.post(
      'admin',
      '/api/connection-accesses',
      {
        connectionId: connection1.id,
        userId: admin2.id,
        duration: 3600,
      },
      400
    );

    assert.equal(
      body.title,
      'User is admin and already has access to connection'
    );
  });

  it('Creates connection accesses', async function () {
    let body = await utils.post('admin', '/api/connection-accesses', {
      connectionId: connection1.id,
      userId: user1.id,
      duration: 3600,
    });

    assert(body.id, 'has id');
    assert(body.connectionId, 'has connectionId');
    assert(body.userId, 'has userId');
    assert.equal(body.connectionName, 'test connection 1');
    assert.equal(body.userEmail, 'user1@test.com');
    assert.equal(body.duration, 3600);
    connectionAccess1 = body;

    body = await utils.post('admin', '/api/connection-accesses', {
      connectionId: connection2.id,
      userId: user2.id,
      duration: 3600,
    });

    assert(body.id, 'has id');
    assert(body.connectionId, 'has connectionId');
    assert(body.userId, 'has userId');
    assert.equal(body.connectionName, 'test connection 2');
    assert.equal(body.userEmail, 'user2@test.com');
    assert.equal(body.duration, 3600);
  });

  it('Gets array of active accesses', async function () {
    const body = await utils.get('admin', '/api/connection-accesses');
    assert.equal(body.length, 2, '2 length');
  });

  it('Requires authentication', function () {
    return utils.get(null, `/api/connection-accesses/${connection1.id}`, 401);
  });

  it('Create requires admin', function () {
    return utils.post(
      'editor',
      '/api/connection-accesses',
      {
        connectionId: connection2.id,
        userId: user2.id,
        duration: 3600,
      },
      403
    );
  });

  it('Expire requires admin', function () {
    return utils.put(
      'editor',
      `/api/connection-accesses/${connectionAccess1}/expire`,
      {},
      403
    );
  });

  it('Expire active connection', function () {
    return utils.put(
      'admin',
      `/api/connection-accesses/${connectionAccess1.id}/expire`
    );
  });

  it('Gets array of 1 active access ', async function () {
    const body = await utils.get('editor', '/api/connection-accesses');
    assert.equal(body.length, 1, '1 length');
  });

  it('Gets array of 3 accesses including inactives', async function () {
    const body = await utils.get(
      'editor',
      '/api/connection-accesses?includeInactives=true'
    );
    assert.equal(body.length, 3, '3 length');
  });
});
