const assert = require('assert');
const utils = require('../utils');

describe('api/queries', function() {
  let query;

  before(function() {
    return utils.resetWithUser();
  });

  it('Returns empty array', async function() {
    const body = await utils.get('admin', '/api/queries');
    assert(!body.error, 'Expect no error');
    assert(Array.isArray(body.queries), 'queries is an array');
    assert.equal(body.queries.length, 0, '0 length');
  });

  it('Creates query', async function() {
    const body = await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      queryText: 'select * from allStuff',
      chartConfiguration: {
        chartType: 'line',
        fields: {
          x: 'field1',
          y: 'field2'
        }
      }
    });

    assert(!body.error, 'no error');
    assert(body.query._id, 'has _id');
    assert.equal(body.query.name, 'test query');
    query = body.query;
  });

  it('Gets array of 1', async function() {
    const body = await utils.get('admin', '/api/queries');
    assert.equal(body.queries.length, 1, '1 length');
  });

  it('Updates query', async function() {
    const body = await utils.put('admin', `/api/queries/${query._id}`, {
      name: 'test query2',
      tags: ['one', 'two'],
      connectionId: 'TODO'
    });

    assert(!body.error, 'no error');
    assert(body.query._id, 'has _id');
    assert.equal(body.query.name, 'test query2');
  });

  it('Gets updated connection', async function() {
    const body = await utils.get('admin', `/api/queries/${query._id}`);
    assert(!body.error, 'no error');
    assert.equal(body.query.name, 'test query2');
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/queries/${query._id}`, 302);
  });

  it('Deletes query', async function() {
    const body = await utils.del('admin', `/api/queries/${query._id}`);
    assert(!body.error, 'no error');
  });

  it('Returns empty array', async function() {
    const body = await utils.get('admin', '/api/queries');
    assert(!body.error, 'Expect no error');
    assert(Array.isArray(body.queries), 'queries is an array');
    assert.equal(body.queries.length, 0, '0 length');
  });
});
