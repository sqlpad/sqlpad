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
    const body = await utils.get(null, `/api/queries/${query._id}`, 302);
    assert(!body.error, 'Expect no error');
  });

  it('Gets result without auth', async function() {
    const body = await utils.get(null, `/api/query-result/${query._id}`, 302);
    assert(!body.error, 'Expect no error');
  });
});
