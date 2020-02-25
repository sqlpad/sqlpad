const assert = require('assert');
const TestUtils = require('../utils');

describe('api/drivers', function() {
  const utils = new TestUtils();

  before(function() {
    return utils.init(true);
  });

  it('gets drivers', async function() {
    const body = await utils.get('editor', '/api/drivers');
    const { drivers, error } = body;
    assert(!error, 'Expect no error');
    assert(
      drivers.find(i => i.id === 'postgres'),
      'has postgres'
    );
  });
});
