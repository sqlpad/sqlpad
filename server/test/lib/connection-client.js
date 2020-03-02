const assert = require('assert');
const ConnectionClient = require('../../lib/connection-client');

describe('ConnectionClient', function() {
  it('loads and exposes api', async function() {
    const connectionClient = new ConnectionClient({
      driver: 'postgres',
      name: 'test'
    });

    assert(typeof connectionClient.getSchema === 'function');
    assert(typeof connectionClient.runQuery === 'function');
    assert(typeof connectionClient.testConnection === 'function');
    // Notes for later. These methods will be added eventually
    // assert(typeof connectionClient.connect === 'function');
    // assert(typeof connectionClient.disconnect === 'function');
    // assert(typeof connectionClient.keepAlive === 'function');
    // assert(typeof connectionClient.getStatus === 'function');
  });
});
