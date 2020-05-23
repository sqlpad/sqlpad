const assert = require('assert');
const TestUtils = require('../utils');

const query1 = `SELECT 1 AS id, 'blue' AS color`;
const query2 = `SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color ORDER BY id`;

const queryText = `${query1};${query2}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('api/batches', function () {
  this.timeout(5000);

  /**
   * @type {TestUtils}
   */
  let utils;
  let query;
  let connection;
  let batch;
  let statement1;
  let statement2;

  before(async function () {
    utils = new TestUtils();
    await utils.init(true);

    connection = await utils.post('admin', '/api/connections', {
      name: 'test connection',
      driver: 'sqlite',
      data: {
        filename: './test/fixtures/sales.sqlite',
      },
    });

    query = await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['test'],
      connectionId: connection.id,
      queryText,
    });
  });

  it('Creates batch', async function () {
    batch = await utils.post('admin', `/api/batches`, {
      connectionId: connection.id,
      queryId: query.id,
      queryName: 'test query',
      batchText: queryText,
      selectedText: queryText,
    });
    assert(batch.id);
    assert.equal(batch.statements.length, 2);
    assert.equal(batch.status, 'started');
    batch = await utils.get('admin', `/api/batches/${batch.id}`);
  });

  it('GETs batch statements', async function () {
    // this could be flaky,
    // but hopefully sqlite query runs faster than 1 second
    await wait(1000);
    const statements = await utils.get(
      'admin',
      `/api/batches/${batch.id}/statements`
    );
    assert.equal(statements.length, 2);

    statement1 = statements[0];
    assert.equal(statement1.sequence, 1);
    assert.equal(statement1.statementText, query1);
    assert.equal(statement1.batchId, batch.id);
    assert.equal(statement1.status, 'finished');
    assert.equal(statement1.rowCount, 1);
    assert(statement1.resultPath.indexOf(statement1.id));
    assert(statement1.resultPath.includes('results'));

    statement2 = statements[1];
    assert.equal(statement2.sequence, 2);
    assert.equal(statement2.statementText, query2);
    assert.equal(statement2.batchId, batch.id);
    assert.equal(statement2.status, 'finished');
    assert.equal(statement2.rowCount, 2);

    let column = statement2.columns[0];
    assert.equal(column.name, 'id');
    assert.equal(column.datatype, 'number');

    column = statement2.columns[1];
    assert.equal(column.name, 'color');
    assert.equal(column.datatype, 'string');
  });

  it('Gets statement from api', async function () {
    statement1 = await utils.get(
      'admin',
      `/api/batches/${batch.id}/statements/${statement1.id}`
    );
    assert.equal(statement1.sequence, 1);
    assert.equal(statement1.statementText, query1);
    assert.equal(statement1.batchId, batch.id);
    assert.equal(statement1.status, 'finished');
    assert.equal(statement1.rowCount, 1);
    assert(statement1.resultPath.indexOf(statement1.id));
    assert(statement1.resultPath.includes('results'));
  });

  it('Gets statement result', async function () {
    const result1 = await utils.get(
      'admin',
      `/api/batches/${batch.id}/statements/${statement1.id}/results`
    );
    assert.deepEqual(result1, [[1, 'blue']]);

    const result2 = await utils.get(
      'admin',
      `/api/batches/${batch.id}/statements/${statement2.id}/results`
    );
    assert.deepEqual(result2, [
      [1, 'blue'],
      [2, 'red'],
    ]);
  });

  it('Only batch creator can view batch', async function () {
    const adminBatches = await utils.get('admin', `/api/batches`);
    assert.equal(adminBatches.length, 1);
    const editorBatches = await utils.get('editor', `/api/batches`);
    assert.equal(editorBatches.length, 0);
    await utils.get('editor', `/api/batches/${batch.id}`, 403);
    await utils.get('editor', `/api/batches/${batch.id}/statements`, 403);
    await utils.get(
      'editor',
      `/api/batches/${batch.id}/statements/${statement1.id}`,
      403
    );
    await utils.get(
      'editor',
      `/api/batches/${batch.id}/statements/${statement1.id}/results`,
      403
    );
  });

  it.skip('Handles query error', async function () {
    // TODO
  });

  it('statement without rows does not create file', async function () {
    let b = await utils.post('admin', `/api/batches`, {
      connectionId: connection.id,
      queryName: 'test query',
      batchText: `SELECT 1 AS id WHERE 1 = 0`,
      selectedText: `SELECT 1 AS id WHERE 1 = 0`,
    });
    await wait(500);
    b = await utils.get('admin', `/api/batches/${b.id}`);
    console.log(b.statements[0]);
    assert.equal(b.statements[0].resultPath, null);
  });
});