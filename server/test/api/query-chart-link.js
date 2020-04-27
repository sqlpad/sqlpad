const assert = require('assert');
const TestUtils = require('../utils');

const queryText = `
  SELECT * 
  FROM vw_sales 
  ORDER BY id 
  LIMIT 10
`;

// This test used to ensure that these routes were accessible with tableChartLinksRequireAuth=false
// This setting no longer exists, and auth is *always required* for these routes
// The tests have been updated accordingly to ensure this is as expected
describe('query table/chart require auth', function() {
  const utils = new TestUtils({});
  let query;
  let connection;

  before(async function() {
    await utils.init(true);

    connection = await utils.post('admin', '/api/connections', {
      name: 'test',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite'
    });

    query = await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['test'],
      connectionId: connection.id,
      queryText
    });
  });

  it('Gets query without auth not permitted', async function() {
    await utils.get(null, `/api/queries/${query.id}`, 401);
  });

  it('Gets result without auth not permitted', async function() {
    const body = await utils.get(null, `/api/query-result/${query.id}`, 401);
    assert(!body.error, 'Expect no error');
  });
});
