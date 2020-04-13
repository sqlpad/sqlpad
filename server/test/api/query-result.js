const assert = require('assert');
const TestUtils = require('../utils');

const queryText = `
  SELECT id, color
  FROM vw_sales 
  ORDER BY id 
  LIMIT 10
`;

function validateQueryResult(queryResult) {
  assert(queryResult.id, 'id');
  assert(queryResult.cacheKey, 'cacheKey');
  assert(queryResult.startTime, 'startTime');
  assert(queryResult.stopTime, 'stopTime');
  assert(queryResult.queryRunTime >= 0, 'queryRunTime');
  assert(Array.isArray(queryResult.fields), 'fields');
  assert.equal(queryResult.fields.length, 2, 'fields length');
  assert.equal(queryResult.fields[0], 'id', 'field id');
  assert.equal(queryResult.incomplete, false, 'incomplete');
  assert(queryResult.meta, 'meta');
  assert(queryResult.meta.color, 'meta.color');
  assert(Array.isArray(queryResult.rows), 'rows is array');
  assert.equal(queryResult.rows.length, 10, 'rows length');
}

describe('api/query-result', function() {
  const utils = new TestUtils();
  let query;
  let connection;

  before(async function() {
    await utils.init(true);

    connection = await utils.post('admin', '/api/connections', {
      name: 'test connection',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite'
    });

    query = await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['test'],
      connectionId: connection._id,
      queryText
    });
  });

  it('GET /api/query-result/:queryId', async function() {
    const body = await utils.get('admin', `/api/query-result/${query._id}`);
    validateQueryResult(body);
  });

  it('POST /api/query-result', async function() {
    const body = await utils.post('admin', `/api/query-result`, {
      connectionId: connection._id,
      cacheKey: 'cachekey',
      queryName: 'test query',
      queryText
    });
    validateQueryResult(body);
  });
});
