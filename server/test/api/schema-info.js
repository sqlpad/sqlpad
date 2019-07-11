const assert = require('assert');
const utils = require('../utils');

describe('api/schema-info', function() {
  let connection;

  before(async function() {
    await utils.resetWithUser();
    const body = await utils.post('admin', '/api/connections', {
      driver: 'mock',
      name: 'sqlpad',
      host: 'localhost',
      database: 'sqlpad',
      username: 'sqlpad',
      password: 'sqlpad'
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
