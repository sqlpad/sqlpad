const assert = require('assert');
const TestUtils = require('../utils');

describe('seedDataPath', function() {
  it('Loads files as expected', async function() {
    const utils = new TestUtils({
      seedDataPath: './test/fixtures/seed-data'
    });
    await utils.init();
    const queries = await utils.models.queries.findAll();
    assert.strictEqual(queries.length, 2);
    assert(queries.find(q => q.id === 'seed-query-1'));
    const queryAcls = await utils.models.queryAcl.findAllByQueryId(
      'seed-query-1'
    );
    assert.equal(queryAcls.length, 3);
    const connections = await utils.models.connections.findAll();
    assert.equal(connections.length, 1);
    assert.strictEqual(connections[0].id, 'seed-connection-1');
  });

  it('Handles child directories with no valid files', async function() {
    const utils = new TestUtils({
      seedDataPath: './test/fixtures/seed-data-empty-child'
    });
    await utils.init();
    const queries = await utils.models.queries.findAll();
    assert.strictEqual(queries.length, 0);
  });

  it('Handles directory that does not exist', async function() {
    const utils = new TestUtils({
      seedDataPath: './test/fixtures/does-not-exist'
    });
    await utils.init();
    const queries = await utils.models.queries.findAll();
    assert.strictEqual(queries.length, 0);
  });

  it('throws for invalid data', async function() {
    const utils = new TestUtils({
      seedDataPath: './test/fixtures/seed-data-bad-file'
    });
    await assert.rejects(() => utils.init());
    const queries = await utils.models.queries.findAll();
    assert.strictEqual(queries.length, 0);
  });
});
