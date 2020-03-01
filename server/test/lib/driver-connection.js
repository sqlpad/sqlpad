const assert = require('assert');
const DriverConnection = require('../../lib/driver-connection');

describe('DriverConnection', function() {
  it('loads and exposes api', async function() {
    const driverConnection = new DriverConnection({
      driver: 'postgres',
      name: 'test'
    });

    assert(typeof driverConnection.getSchema === 'function');
    assert(typeof driverConnection.runQuery === 'function');
    assert(typeof driverConnection.testConnection === 'function');
    // Notes for later. These methods will be added eventually
    // assert(typeof driverConnection.connect === 'function');
    // assert(typeof driverConnection.disconnect === 'function');
    // assert(typeof driverConnection.keepAlive === 'function');
    // assert(typeof driverConnection.getStatus === 'function');
  });
});
