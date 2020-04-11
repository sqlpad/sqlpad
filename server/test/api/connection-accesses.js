const assert = require('assert');
const TestUtils = require('../utils');
const consts = require('../../lib/consts');

describe('api/connection-accesses', function() {
  const utils = new TestUtils();
  let admin2;
  let user1;
  let user2;
  let connection1;
  let connection2;
  let defeaultConnectionAccess;
  let connectionAccess1;

  before(async function() {
    await utils.init(true);

    let connBody = await utils.post('admin', '/api/connections', {
      name: 'test connection 1',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite'
    });
    connection1 = connBody.data;

    connBody = await utils.post('admin', '/api/connections', {
      name: 'test connection 2',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite'
    });
    connection2 = connBody.data;

    let userBody = await utils.post('admin', '/api/users', {
      email: 'admin2@test.com',
      role: 'admin'
    });
    admin2 = userBody.data;

    userBody = await utils.post('admin', '/api/users', {
      email: 'user1@test.com',
      role: 'editor'
    });
    user1 = userBody.data;

    userBody = await utils.post('admin', '/api/users', {
      email: 'user2@test.com',
      role: 'editor'
    });
    user2 = userBody.data;
  });

  it('Get default connection accesses', async function() {
    const body = await utils.get('admin', '/api/connection-accesses');
    assert(Array.isArray(body.data), 'data is an array');
    assert.equal(body.data.length, 1, '1 length');
    assert(body.data[0]._id, 'has _id');
    assert.equal(body.data[0].connectionId, consts.EVERY_CONNECTION_ID);
    assert.equal(body.data[0].connectionName, consts.EVERY_CONNECTION_NAME);
    assert.equal(body.data[0].userId, consts.EVERYONE_ID);
    assert.equal(body.data[0].userName, consts.EVERYONE_NAME);
    assert.equal(body.data[0].duration, 0);
    assert.equal(new Date(body.data[0].expiryDate).getFullYear(), 2099);
    defeaultConnectionAccess = body.data[0];
  });

  it('Detect default active connection when creating new access', async function() {
    const { errors } = await utils.post(
      'admin',
      '/api/connection-accesses',
      {
        connectionId: connection1._id,
        userId: user1._id,
        duration: 3600
      },
      400
    );

    assert.equal(errors[0].title, 'User has active access to connection');
  });

  it('Expire default access on every connection to every user', function() {
    return utils.put(
      'admin',
      `/api/connection-accesses/${defeaultConnectionAccess._id}/expire`
    );
  });

  it('Returns empty array', async function() {
    const body = await utils.get('admin', '/api/connection-accesses');
    assert(Array.isArray(body.data), 'data is an array');
    assert.equal(body.data.length, 0, '0 length');
  });

  it('Do not create access for admin', async function() {
    const { errors } = await utils.post(
      'admin',
      '/api/connection-accesses',
      {
        connectionId: connection1._id,
        userId: admin2._id,
        duration: 3600
      },
      400
    );

    assert.equal(
      errors[0].title,
      'User is admin and already has access to connection'
    );
  });

  it('Creates connection accesses', async function() {
    let body = await utils.post('admin', '/api/connection-accesses', {
      connectionId: connection1._id,
      userId: user1._id,
      duration: 3600
    });

    assert(body.data._id, 'has _id');
    assert(body.data.connectionId, 'has connectionId');
    assert(body.data.userId, 'has userId');
    assert.equal(body.data.connectionName, 'test connection 1');
    assert.equal(body.data.userEmail, 'user1@test.com');
    assert.equal(body.data.duration, 3600);
    connectionAccess1 = body.data;

    body = await utils.post('admin', '/api/connection-accesses', {
      connectionId: connection2._id,
      userId: user2._id,
      duration: 3600
    });

    assert(body.data._id, 'has _id');
    assert(body.data.connectionId, 'has connectionId');
    assert(body.data.userId, 'has userId');
    assert.equal(body.data.connectionName, 'test connection 2');
    assert.equal(body.data.userEmail, 'user2@test.com');
    assert.equal(body.data.duration, 3600);
  });

  it('Gets array of active accesses', async function() {
    const body = await utils.get('admin', '/api/connection-accesses');
    assert.equal(body.data.length, 2, '2 length');
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/connection-accesses/${connection1._id}`, 401);
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
    assert.equal(body.data.length, 1, '1 length');
  });

  it('Gets array of 3 accesses including inactives', async function() {
    const body = await utils.get(
      'editor',
      '/api/connection-accesses?includeInactives=true'
    );
    assert.equal(body.data.length, 3, '3 length');
  });
});
