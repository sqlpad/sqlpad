const assert = require('assert');
const TestUtils = require('../utils');

const queryText = `
  -- dimensions = department 10, orderdate 10
  -- measures = cost, revenue, profit
  -- orderby = department desc, orderdate asc
  -- limit = 100
`;

function validateQueryResult(queryResult) {
  assert(queryResult.id, 'id');
  assert(queryResult.cacheKey, 'cacheKey');
  assert(queryResult.startTime, 'startTime');
  assert(queryResult.stopTime, 'stopTime');
  assert(queryResult.queryRunTime >= 0, 'queryRunTime');
  assert(Array.isArray(queryResult.fields), 'fields');
  assert.equal(queryResult.fields.length, 5, 'fields length');
  assert.equal(queryResult.fields[0], 'department', 'field department');
  assert.equal(queryResult.incomplete, false, 'incomplete');
  assert(queryResult.meta, 'meta');
  assert(queryResult.meta.department, 'meta.department');
  assert(Array.isArray(queryResult.rows), 'rows is array');
  assert.equal(queryResult.rows.length, 100, 'rows length');
}

describe('api/query-result', function() {
  const utils = new TestUtils();
  let query;
  let connection;

  before(async function() {
    await utils.init(true);

    const connBody = await utils.post('admin', '/api/connections', {
      name: 'test postgres',
      driver: 'mock',
      host: 'localhost',
      database: 'sqlpad',
      username: 'sqlpad',
      password: 'sqlpad',
      wait: 0
    });
    connection = connBody.connection;

    const queryBody = await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['test', 'postgres'],
      connectionId: connection._id,
      queryText
    });
    query = queryBody.query;
  });

  it('GET /api/query-result/:queryId', async function() {
    const body = await utils.get('admin', `/api/query-result/${query._id}`);
    assert(!body.error, 'Expect no error');
    validateQueryResult(body.queryResult);
  });

  it('POST /api/query-result', async function() {
    const body = await utils.post('admin', `/api/query-result`, {
      connectionId: connection._id,
      cacheKey: 'cachekey',
      queryName: 'test query',
      queryText
    });

    assert(!body.error, 'Expect no error');
    validateQueryResult(body.queryResult);
  });
});
