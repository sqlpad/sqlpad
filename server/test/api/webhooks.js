/* eslint-disable no-await-in-loop */
const assert = require('assert');
const TestUtils = require('../utils');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('api/webhooks', function () {
  it('does not fire if not enabled', async function () {
    const hookServer = await TestUtils.makeHookServer();

    const utils = new TestUtils({
      port: 9000,
      publicUrl: 'http://mysqlpad.com',
      baseUrl: '/sqlpad',
      webhookSecret: 'secret',
      webhookUserCreatedUrl: hookServer.url,
    });
    await utils.init(true);

    await utils.post('admin', '/sqlpad/api/users', {
      email: 'user1@test.com',
      name: 'user1',
      role: 'editor',
      data: {
        create: true,
      },
    });

    await wait(200);
    assert.equal(hookServer.responses.length, 0);
  });

  it('userCreated', async function () {
    const hookServer = await TestUtils.makeHookServer();

    const utils = new TestUtils({
      port: 9000,
      publicUrl: 'http://mysqlpad.com',
      baseUrl: '/sqlpad',
      webhookEnabled: true,
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

    await wait(200);

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
    assert.equal(
      hookServer.responses[0].headers['sqlpad-hook-name'],
      'user_created'
    );

    hookServer.server.close();
  });

  // TODO FIXME XXX consider auto-user creation

  it('queryCreated', async function () {
    const hookServer = await TestUtils.makeHookServer();
    const utils = new TestUtils({
      webhookEnabled: true,
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

    await wait(200);

    // no secret or url headers this time
    assert.equal(hookServer.responses[0].headers['sqlpad-secret'], '');
    assert.equal(hookServer.responses[0].headers['sqlpad-url'], '');
    assert.equal(
      hookServer.responses[0].headers['sqlpad-hook-name'],
      'query_created'
    );

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

    hookServer.server.close();
  });

  it('batchCreated / batchFinished / statementCreated / statementFinished', async function () {
    const hookServer = await TestUtils.makeHookServer();
    const utils = new TestUtils({
      webhookEnabled: true,
      webhookBatchCreatedUrl: hookServer.url,
      webhookBatchFinishedUrl: hookServer.url,
      webhookStatementCreatedUrl: hookServer.url,
      webhookStatementFinishedUrl: hookServer.url,
    });
    await utils.init(true);

    const connection = await utils.post('admin', '/api/connections', {
      name: 'test connection',
      driver: 'sqlite',
      data: {
        filename: './test/fixtures/sales.sqlite',
      },
    });

    const queryText = `SELECT 1 AS id, 'blue' AS color`;
    const query = await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['test'],
      connectionId: connection.id,
      queryText,
    });

    let batch = await utils.post('admin', `/api/batches`, {
      connectionId: connection.id,
      queryId: query.id,
      batchText: queryText,
      selectedText: queryText,
    });

    batch = await utils.get('admin', `/api/batches/${batch.id}`);
    while (batch.status !== 'finished' && batch.status !== 'errored') {
      await wait(50);
      batch = await utils.get('admin', `/api/batches/${batch.id}`);
    }
    assert.equal(batch.status, 'finished');
    assert(batch.startTime);
    assert(batch.stopTime);
    assert(batch.durationMs > 0);

    const statements = await utils.get(
      'admin',
      `/api/batches/${batch.id}/statements`
    );
    assert.equal(statements.length, 1);

    const statement1 = statements[0];

    const result1 = await utils.get(
      'admin',
      `/api/statements/${statement1.id}/results`
    );
    assert.deepEqual(result1, [[1, 'blue']]);

    // TODO FIXME XXX - test batch and statement bodies

    // const { body: batchCreatedBody } = hookServer.responses.find(
    //   (r) => r.headers['sqlpad-hook-name'] === 'batch_created'
    // );

    // const { body: batchFinishedBody } = hookServer.responses.find(
    //   (r) => r.headers['sqlpad-hook-name'] === 'batch_finished'
    // );
  });
});
