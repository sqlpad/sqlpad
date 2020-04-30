const assert = require('assert').strict;
const path = require('path');
const TestUtils = require('../utils');
const ConnectionClient = require('../../lib/connection-client');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('lib/connection-clients', function () {
  const utils = new TestUtils();
  let connection1;

  before(async function () {
    await utils.init(true);

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
});
