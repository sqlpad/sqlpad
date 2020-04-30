const assert = require('assert');
const TestUtils = require('../utils');

describe('api/format-sql', function () {
  const utils = new TestUtils();

  before(function () {
    return utils.init(true);
  });

  it('format sql query', async function () {
    const body = await utils.post('admin', '/api/format-sql', {
      query: 'SELECT column_one, column_two FROM sometable',
    });
    assert.equal(
      body.query,
      'SELECT\n  column_one,\n  column_two\nFROM\n  sometable'
    );
  });
});
