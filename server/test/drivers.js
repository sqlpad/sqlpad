const assert = require('assert');
const drivers = require('../drivers');

describe('drivers', function() {
  it('loads and exposes api', function() {
    // This test doesn't test much will expand later
    assert(drivers);
    assert(typeof drivers.getSchema === 'function');
    assert(typeof drivers.runQuery === 'function');
    assert(typeof drivers.testConnection === 'function');
  });
});
