const assert = require('assert');
const TestUtils = require('../utils');

describe('api/drivers', function() {
  const utils = new TestUtils();

  before(function() {
    return utils.init(true);
  });

  it('gets drivers', async function() {
    const body = await utils.get('editor', '/api/drivers');
    const { drivers, error } = body;
    assert(!error, 'Expect no error');
    const postgres = drivers.find(i => i.id === 'postgres');
    assert(postgres, 'has postgres');
    assert.strictEqual(postgres.name, 'Postgres');
    assert(Array.isArray(postgres.fields));
    assert(
      postgres.fields.find(field => field.key === 'postgresSsl'),
      'has postgres specific field'
    );
    assert(
      !postgres.fields.find(field => field.key === 'sqlserverEncrypt'),
      'Does not have a SQL Server field'
    );
  });
});
