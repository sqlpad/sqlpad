const assert = require('assert');
const TestUtils = require('../utils');

describe('api/tags', function () {
  const utils = new TestUtils();

  before(function () {
    return utils.init(true);
  });

  it('Returns empty array', async function () {
    const body = await utils.get('admin', '/api/tags');
    TestUtils.validateListSuccessBody(body);
    assert.equal(body.length, 0, '0 length');
  });

  it('Returns expected array', async function () {
    await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      queryText: 'select * from allStuff',
    });
    await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['one', 'three'],
      connectionId: 'TODO',
      queryText: 'select * from allStuff',
    });

    const body = await utils.get('admin', '/api/tags');
    assert.equal(body.length, 3, '3 length');
  });
});
