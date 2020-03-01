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

  it('renders connection with user', function() {
    const secret = '123<>!@#$%^&*()-_+=';
    const user = {
      data: {
        secret
      }
    };
    const connection = {
      connectionString: '{{user.data.secret}}',
      singleStache: '{single}',
      port: 6543
    };
    const rendered = drivers.renderConnection(connection, user);
    assert.strictEqual(rendered.connectionString, secret);
    assert.strictEqual(rendered.singleStache, '{single}', 'single left alone');
    assert.strictEqual(rendered.port, 6543, 'number left alone');
  });

  it('renders connection without user', function() {
    const connection = {
      connectionString: 'test',
      singleStache: '{single}',
      port: 6543
    };
    const rendered = drivers.renderConnection(connection);
    assert.strictEqual(rendered.connectionString, 'test');
    assert.strictEqual(rendered.singleStache, '{single}');
  });
});
