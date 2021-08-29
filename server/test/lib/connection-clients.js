const assert = require('assert').strict;
const path = require('path');
const TestUtils = require('../utils');
const ConnectionClient = require('../../lib/connection-client');
const { v4: uuidv4 } = require('uuid');
const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('lib/connection-clients', function () {
  const utils = new TestUtils();
  let connection1;
  let connection2;

  before(async function () {
    await utils.init(true);

    AWSMock.setSDKInstance(AWS);

    connection1 = await utils.post('admin', '/api/connections', {
      driver: 'sqlite',
      name: 'connection-client-test',
      data: {
        filename: path.join(
          __dirname,
          '../artifacts/connection-client-test.sqlite'
        ),
      },
      idleTimeoutSeconds: 1,
      multiStatementTransactionEnabled: true,
    });
    connection2 = await utils.post('admin', '/api/connections', {
      driver: 'athena',
      name: 'async-connection-client-test',
      data: {
        awsRegion: 'us-east-1',
      },
    });
  });

  afterEach(async function () {
    // Prevent unadvertently mocking
    AWSMock.restore();
  });

  it('Keep-alive keeps it alive', async function () {
    const connectionClient = new ConnectionClient(
      connection1,
      utils.users.admin
    );
    assert(connectionClient);

    await connectionClient.connect();
    connectionClient.scheduleCleanupInterval(400, 100);
    assert(connectionClient.isConnected());

    await wait(200);
    connectionClient.keepAlive();
    await wait(200);
    connectionClient.keepAlive();
    await wait(200);
    assert(connectionClient.isConnected());
  });

  it('Without keep alive it closes', async function () {
    const connectionClient = new ConnectionClient(
      connection1,
      utils.users.admin
    );
    assert(connectionClient);

    await connectionClient.connect();
    connectionClient.scheduleCleanupInterval(400, 100);
    assert(connectionClient.isConnected());

    await wait(600);
    assert(!connectionClient.isConnected());
  });

  it('Stays-open with activity', async function () {
    const connectionClient = new ConnectionClient(
      connection1,
      utils.users.admin
    );
    assert(connectionClient);

    await connectionClient.connect();
    connectionClient.scheduleCleanupInterval(400, 100);
    assert(connectionClient.isConnected());

    await wait(300);
    connectionClient.keepAlive();
    await wait(300);
    connectionClient.keepAlive();
    await connectionClient.runQuery('SELECT 1 AS val');
    await wait(300);
    connectionClient.keepAlive();
    await wait(300);
    connectionClient.keepAlive();
    assert(connectionClient.isConnected());
  });

  it('Closes without activity', async function () {
    const connectionClient = new ConnectionClient(
      connection1,
      utils.users.admin
    );
    assert(connectionClient);

    await connectionClient.connect();
    connectionClient.scheduleCleanupInterval(400, 100);
    assert(connectionClient.isConnected());

    await wait(300);
    connectionClient.keepAlive();
    await wait(300);
    connectionClient.keepAlive();
    await wait(300);
    connectionClient.keepAlive();
    await wait(300);
    connectionClient.keepAlive();
    assert(!connectionClient.isConnected());
  });

  it('Throws an error when starting an async query with unsupported driver', async function () {
    const connectionClient = new ConnectionClient(
      connection1,
      utils.users.admin
    );
    await assert.rejects(
      connectionClient.startQueryExecution({}),
      new Error('Driver SQLite does not support async queries')
    );
  });

  it('Succeeds starting an async query with a supported driver', async function () {
    const connectionClient = new ConnectionClient(
      connection2,
      utils.users.admin
    );
    const uuid = uuidv4();

    AWSMock.mock('Athena', 'startQueryExecution', () => {
      return Promise.resolve({ QueryExecutionId: uuid });
    });

    const executionId = await connectionClient.startQueryExecution('SELECT 1');
    assert(executionId);
    assert.equal(executionId, uuid);
  });

  it('Throws an error when cancelling an async query with unsupported driver', async function () {
    const connectionClient = new ConnectionClient(
      connection1,
      utils.users.admin
    );

    await assert.rejects(
      connectionClient.cancelQuery(uuidv4()),
      new Error('Driver SQLite does not support cancellation of queries')
    );
  });

  it('Succeeds cancelling an async query with a supported driver', async function () {
    const connectionClient = new ConnectionClient(
      connection2,
      utils.users.admin
    );

    AWSMock.mock('Athena', 'stopQueryExecution', () => {
      return Promise.resolve({});
    });
    const output = await connectionClient.cancelQuery(uuidv4());
    assert(output);
    assert.equal(output, true);
  });
});
