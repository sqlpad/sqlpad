const assert = require('assert');
const TestUtils = require('../utils');
const request = require('supertest');

const queryText = `
  SELECT * 
  FROM vw_sales 
  ORDER BY id 
  LIMIT 10
`;

describe('query table/chart link no auth', function() {
  const utils = new TestUtils({ tableChartLinksRequireAuth: false });
  let query;
  let connection;
  let cacheKey;

  before(async function() {
    await utils.init(true);

    const connBody = await utils.post('admin', '/api/connections', {
      name: 'test',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite'
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
