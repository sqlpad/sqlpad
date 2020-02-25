const assert = require('assert');
const TestUtils = require('../utils');

describe('api/schema-info', function() {
  const utils = new TestUtils();
  let connection;

  before(async function() {
    await utils.init(true);
    const body = await utils.post('admin', '/api/connections', {
      driver: 'mock',
      name: 'sqlpad',
      host: 'localhost',
      database: 'sqlpad',
      username: 'sqlpad',
      password: 'sqlpad',
      wait: 0
    });
    assert(!body.error, 'no error');
    connection = body.connection;
  });

  it('Gets schema-info', async function() {
    const body = await utils.get('admin', `/api/schema-info/${connection._id}`);
    assert(!body.error, 'Expect no error');
    assert(body.schemaInfo, 'body.schemaInfo');
  });
});
