const assert = require('assert');
const TestUtils = require('../utils');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('api/webhooks', function () {
  it('userCreated', async function () {
    const hookServer = await TestUtils.makeHookServer('userCreated');

    const utils = new TestUtils({
      port: 9000,
      publicUrl: 'http://mysqlpad.com',
      baseUrl: '/sqlpad',
      webhookSecret: 'secret',
      webhookUserCreatedUrl: hookServer.url,
    });
    await utils.init(true);

    const user = await utils.post('admin', '/sqlpad/api/users', {
      email: 'user1@test.com',
      name: 'user1',
      role: 'editor',
      data: {
        create: true,
      },
    });

    await sleep(200);

    assert.deepStrictEqual(hookServer.responses[0].body, {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      createdAt: user.createdAt,
    });

    // Only need to test this once
    // Ensure headers are sent as expected
    assert.equal(hookServer.responses[0].headers['sqlpad-secret'], 'secret');
    assert.equal(
      hookServer.responses[0].headers['sqlpad-url'],
      'http://mysqlpad.com:9000/sqlpad'
    );

    hookServer.server.close();
  });

  it('queryCreated', async function () {
    const hookServer = await TestUtils.makeHookServer('queryCreated');
    const utils = new TestUtils({
      webhookQueryCreatedUrl: hookServer.url,
    });
    await utils.init(true);

    const connection = await utils.post('admin', '/api/connections', {
      name: 'test connection',
      driver: 'sqlite',
      data: {
        filename: './test/fixtures/sales.sqlite',
      },
    });

    const queryWithoutCon = await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['one', 'two'],
      queryText: 'SELECT * FROM some_table',
    });

    await utils.post('admin', '/api/queries', {
      name: 'test query 2',
      tags: ['one', 'two'],
      connectionId: connection.id,
      queryText: 'SELECT * FROM some_table',
    });

    await sleep(200);

    // no secret or url headers this time
    assert.equal(hookServer.responses[0].headers['sqlpad-secret'], '');
    assert.equal(hookServer.responses[0].headers['sqlpad-url'], '');

    const body1 = hookServer.responses[0].body;
    assert.equal(body1.id, queryWithoutCon.id, 'query r1');
    assert.equal(body1.name, queryWithoutCon.name);
    assert.deepStrictEqual(body1.tags, queryWithoutCon.tags);
    assert.equal(body1.queryText, queryWithoutCon.queryText);
    assert.equal(body1.createdAt, queryWithoutCon.createdAt);
    assert.deepEqual(body1.createdByUser, queryWithoutCon.createdByUser);
    assert(!body1.connection);

    const body2 = hookServer.responses[1].body;
    assert.equal(body2.connection.id, connection.id, 'connection r2');
    assert.equal(body2.connection.name, connection.name);
    assert.equal(body2.connection.driver, connection.driver);
  });
});
