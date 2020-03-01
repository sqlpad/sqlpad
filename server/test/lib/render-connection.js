const assert = require('assert');
const renderConnection = require('../../lib/render-connection');

describe('lib/render-connection', function() {
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
    const rendered = renderConnection(connection, user);
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
    const rendered = renderConnection(connection);
    assert.strictEqual(rendered.connectionString, 'test');
    assert.strictEqual(rendered.singleStache, '{single}');
  });
});
