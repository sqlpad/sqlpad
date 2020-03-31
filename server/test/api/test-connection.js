const assert = require('assert');
const TestUtils = require('../utils');

describe('api/test-connection', function() {
  const utils = new TestUtils();

  before(function() {
    return utils.init(true);
  });

  it('tests connection', async function() {
    const body = await utils.post('admin', '/api/test-connection', {
      name: 'test connection',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite'
    });
    assert(!body.error, 'Expect no error');
  });
});
