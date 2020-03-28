const assert = require('assert');
const TestUtils = require('../utils');
const request = require('supertest');

const queryText = `
  -- dimensions = department 10, orderdate 10
  -- measures = cost, revenue, profit
  -- orderby = department desc, orderdate asc
  -- limit = 100
`;

describe('query table/chart link no auth', function() {
  const utils = new TestUtils({ tableChartLinksRequireAuth: false });
  let query;
  let connection;
  let cacheKey;

  before(async function() {
    await utils.init(true);

    const connBody = await utils.post('admin', '/api/connections', {
      name: 'test mock',
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
      tags: ['test'],
      connectionId: connection._id,
      queryText
    });
    query = queryBody.query;
  });

  it('Gets query without auth', async function() {
    const body = await utils.get(null, `/api/queries/${query._id}`);
    assert(!body.error, 'Expect no error');
  });

  it('Gets result without auth', async function() {
    const body = await utils.get(null, `/api/query-result/${query._id}`);
    assert(!body.error, 'Expect no error');
    cacheKey = body.queryResult.cacheKey;
  });

  it('Downloads results without auth', async function() {
    const csvRes = await request(utils.app)
      .get(`/download-results/${cacheKey}.csv`)
      .expect(200);
    assert(csvRes.text);
  });
});
