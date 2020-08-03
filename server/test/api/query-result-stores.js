/* eslint-disable no-await-in-loop */
const assert = require('assert');
const TestUtils = require('../utils');

const query1 = `SELECT 1 AS id, 'blue' AS color`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testBatchToCompletion(config) {
  const utils = new TestUtils(config);
  await utils.init(true);

  const connection = await utils.post('admin', '/api/connections', {
    name: 'test connection',
    driver: 'sqlite',
    data: {
      filename: './test/fixtures/sales.sqlite',
    },
  });

  let batch = await utils.post('admin', `/api/batches`, {
    connectionId: connection.id,
    batchText: query1,
  });
  while (batch.status !== 'finished' && batch.status !== 'error') {
    await wait(25);
    batch = await utils.get('admin', `/api/batches/${batch.id}`);
  }

  const statements = await utils.get(
    'admin',
    `/api/batches/${batch.id}/statements`
  );

  const statement1 = statements[0];

  let result1 = await utils.get(
    'admin',
    `/api/statements/${statement1.id}/results`
  );
  assert.deepEqual(result1, [[1, 'blue']], 'results as expected');

  // remove should succeed
  await utils.models.statements.removeById(statement1.id);
  await utils.get('admin', `/api/statements/${statement1.id}/results`, 404);
}

describe('api/query-result-stores', function () {
  it('file', async function () {
    return testBatchToCompletion({ queryResultStore: 'file' });
  });

  it('redis', async function () {
    const available = await TestUtils.redisAvailable('redis://localhost:6379');
    if (!available) {
      return this.skip();
    }
    return testBatchToCompletion({
      queryResultStore: 'redis',
      redisUri: 'redis://localhost:6379',
    });
  });

  it('database', async function () {
    return testBatchToCompletion({
      queryResultStore: 'database',
    });
  });

  it('memory', async function () {
    return testBatchToCompletion({
      queryResultStore: 'memory',
    });
  });
});
