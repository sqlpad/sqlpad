const assert = require('assert');
const TestUtils = require('../utils');

describe('api/tags', function() {
  const utils = new TestUtils();

  before(function() {
    return utils.init(true);
  });

  it('Returns empty array', async function() {
    const body = await utils.get('admin', '/api/tags');
    assert(!body.error, 'Expect no error');
    assert(Array.isArray(body.tags), 'tags is an array');
    assert.equal(body.tags.length, 0, '0 length');
  });

  it('Returns expected array', async function() {
    const b1 = await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      queryText: 'select * from allStuff'
    });
    assert(!b1.error, 'no error');
    const b2 = await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['one', 'three'],
      connectionId: 'TODO',
      queryText: 'select * from allStuff'
    });
    assert(!b2.error, 'no error');

    const b3 = await utils.get('admin', '/api/tags');
    assert(!b3.error, 'Expect no error');
    assert.equal(b3.tags.length, 3, '3 length');
  });
});
