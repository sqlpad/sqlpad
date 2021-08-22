/* eslint-disable no-await-in-loop */
const assert = require('assert');
const bytes = require('bytes');
const fs = require('fs');
const util = require('util');
const path = require('path');
const TestUtils = require('../utils');
const access = util.promisify(fs.access);
const { v4: uuidv4 } = require('uuid');
const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

const query1 = `SELECT 1 AS id, 'blue' AS color`;
const query2 = `SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color ORDER BY id`;

const queryText = `${query1};${query2}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setupAthenaMock() {
  AWSMock.setSDKInstance(AWS);

  AWSMock.mock('Athena', 'startQueryExecution', () => {
    return Promise.resolve({ QueryExecutionId: uuidv4() });
  });
  AWSMock.mock('Athena', 'stopQueryExecution', () => {
    return Promise.resolve({});
  });
  AWSMock.mock('Athena', 'getQueryResults', () => {
    return Promise.resolve({ results: [] });
  });
  AWSMock.mock('Athena', 'getQueryExecution', () => {
    return Promise.resolve({
      QueryExecution: {
        Status: { State: 'SUCCEEDED' },
        ResultConfiguration: { OutputLocation: 's3://test/location/data.csv' },
        StatementType: 'DML',
      },
    });
  });
  AWSMock.mock('S3', 'getObject', () => {
    return Promise.resolve({});
  });
}

describe('api/batches', function () {
  /**
   * @type {TestUtils}
   */
  let utils;
  let query;
  let asyncQuery;
  let connection;
  let asyncDriverConnection;
  let batch;
  let batchWithoutQueryId;
  let statement1;
  let statement2;

  async function createBatchToCompletion(data) {
    let batch = await utils.post('admin', `/api/batches`, data);
    while (batch.status !== 'finished' && batch.status !== 'error') {
      await wait(25);
      batch = await utils.get('admin', `/api/batches/${batch.id}`);
    }
    return batch;
  }

  before(async function () {
    utils = new TestUtils({
      queryResultMaxRows: 3,
      queryHistoryRetentionTimeInDays: 0,
      queryResultStore: 'file',
    });
    await utils.init(true);

    setupAthenaMock();

    connection = await utils.post('admin', '/api/connections', {
      name: 'test connection',
      driver: 'sqlite',
      data: {
        filename: './test/fixtures/sales.sqlite',
      },
    });

    asyncDriverConnection = await utils.post('admin', '/api/connections', {
      driver: 'athena',
      name: 'test async driver connection',
      data: {
        awsRegion: 'us-east-1',
        awsAccessKeyId: 'access',
        awsSecretAccessKey: 'secret',
      },
    });

    query = await utils.post('admin', '/api/queries', {
      name: 'test query',
      tags: ['test'],
      connectionId: connection.id,
      queryText,
    });

    asyncQuery = await utils.post('admin', '/api/queries', {
      name: 'test async connection query',
      tags: ['test'],
      connectionId: asyncDriverConnection.id,
      queryText,
    });
  });

  after(async function () {
    // Bring back the library to avoid hiding issues by inadvertently mocking
    AWSMock.restore();
  });

  it('Creates batch', async function () {
    batch = await utils.post('admin', `/api/batches`, {
      connectionId: connection.id,
      queryId: query.id,
      batchText: queryText,
      selectedText: queryText,
    });
    assert(batch.id);
    assert.equal(batch.statements.length, 2);
    assert.equal(batch.status, 'started');
  });

  it('creates batch without query id', async function () {
    batchWithoutQueryId = await utils.post('admin', `/api/batches`, {
      connectionId: connection.id,
      batchText: queryText,
      selectedText: queryText,
    });
    assert(batchWithoutQueryId.id);
  });

  it('gets list for query id including statements', async function () {
    const batches = await utils.get(
      'admin',
      `/api/batches?queryId=${query.id}&includeStatements=true`
    );
    const foundBatch = batches.find((b) => b.id === batch.id);
    assert.strictEqual(foundBatch.statements.length, 2);
  });

  it('gets list for query id without statements', async function () {
    const batches = await utils.get(
      'admin',
      `/api/batches?queryId=${query.id}&includeStatements=false`
    );
    const foundBatch = batches.find((b) => b.id === batch.id);
    assert(!foundBatch.statements);
  });

  it('gets list for no queryId including statements', async function () {
    const batches = await utils.get(
      'admin',
      `/api/batches?queryId=null&includeStatements=true`
    );
    const foundBatch = batches.find((b) => b.id === batchWithoutQueryId.id);
    assert.strictEqual(foundBatch.statements.length, 2);
  });

  it('gets list for no query id without statements', async function () {
    const batches = await utils.get(
      'admin',
      `/api/batches?queryId=null&includeStatements=false`
    );
    const foundBatch = batches.find((b) => b.id === batchWithoutQueryId.id);
    assert(!foundBatch.statements);
  });

  it('GETs finished result', async function () {
    batch = await utils.get('admin', `/api/batches/${batch.id}`);
    while (batch.status !== 'finished' && batch.status !== 'errored') {
      await wait(50);
      batch = await utils.get('admin', `/api/batches/${batch.id}`);
    }
    assert.equal(batch.status, 'finished');
    assert(batch.startTime);
    assert(batch.stopTime);
    assert(batch.durationMs > 0);

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
    assert(statement1.startTime);
    assert(statement1.stopTime);
    assert(statement1.durationMs > 0);
    assert(statement1.resultsPath.indexOf(statement1.id));
    assert(statement1.resultsPath.includes('results'));

    statement2 = statements[1];
    assert.equal(statement2.sequence, 2);
    assert.equal(statement2.statementText, query2);
    assert.equal(statement2.batchId, batch.id);
    assert.equal(statement2.status, 'finished');
    assert.equal(statement2.rowCount, 2);

    assert(Array.isArray(statement2.columns), 'statement.columns is an array');

    let column = statement2.columns[0];
    assert.equal(column.name, 'id');
    assert.equal(column.datatype, 'number');

    column = statement2.columns[1];
    assert.equal(column.name, 'color');
    assert.equal(column.datatype, 'string');
  });

  it('Gets statement from api', async function () {
    statement1 = await utils.get('admin', `/api/statements/${statement1.id}`);
    assert.equal(statement1.sequence, 1);
    assert.equal(statement1.statementText, query1);
    assert.equal(statement1.batchId, batch.id);
    assert.equal(statement1.status, 'finished');
    assert.equal(statement1.rowCount, 1);
    assert(statement1.resultsPath.indexOf(statement1.id));
    assert(statement1.resultsPath.includes('results'));
  });

  it('Gets statement result', async function () {
    const result1 = await utils.get(
      'admin',
      `/api/statements/${statement1.id}/results`
    );
    assert.deepEqual(result1, [[1, 'blue']]);

    const result2 = await utils.get(
      'admin',
      `/api/statements/${statement2.id}/results`
    );
    assert.deepEqual(result2, [
      [1, 'blue'],
      [2, 'red'],
    ]);

    // Test downloads
    let res = await utils.getResponse(
      'admin',
      `/statement-results/${statement1.id}.csv`,
      200
    );
    assert.equal(res.type, 'text/csv');
    assert.equal(res.text, 'id,color\r\n1,blue');

    res = await utils.getResponse(
      'admin',
      `/statement-results/${statement1.id}.json`,
      200
    );
    assert.equal(res.type, 'application/json');
    assert.equal(res.text, '[{"id":1,"color":"blue"}]');

    res = await utils.getResponse(
      'admin',
      `/statement-results/${statement1.id}.xlsx`,
      200
    );
    assert.equal(
      res.type,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    // For xlsx, we'll assume generated file is as expected
  });

  it('Only batch creator can view batch', async function () {
    const adminBatches = await utils.get('admin', `/api/batches`);
    assert.equal(adminBatches.length, 2);
    const editorBatches = await utils.get('editor', `/api/batches`);
    assert.equal(editorBatches.length, 0);
    await utils.get('editor', `/api/batches/${batch.id}`, 403);
    await utils.get('editor', `/api/batches/${batch.id}/statements`, 403);
    await utils.get('editor', `/api/statements/${statement1.id}`, 403);
    await utils.get('editor', `/api/statements/${statement1.id}/results`, 403);
  });

  it('Handles query error', async function () {
    let b = await createBatchToCompletion({
      connectionId: connection.id,
      batchText: `SELECT * FROM; SELECT 1 AS id`,
    });
    assert.equal(b.status, 'error');
    assert.equal(b.statements[0].status, 'error');
    assert.equal(b.statements[0].rowCount, null, 'no rowCount');
    assert.equal(b.statements[0].resultsPath, null, 'no resultpath');
    assert(b.statements[0].startTime, 'has startTime');
    assert(b.statements[0].stopTime, 'has stopTime');
    assert.deepEqual(b.statements[0].error, {
      title: 'SQLITE_ERROR: incomplete input',
    });

    await utils.get(
      'admin',
      `/api/statements/${b.statements[0].id}/results`,
      404
    );

    assert.equal(b.statements[1].status, 'cancelled');
    assert.equal(b.statements[1].rowCount, null, 'no rowCount');
    assert.equal(b.statements[1].resultsPath, null, 'no resultpath');
    assert.equal(b.statements[1].startTime, null, 'no startTime');
    assert.equal(b.statements[1].stopTime, null, 'no stopTime');

    await utils.get(
      'admin',
      `/api/statements/${b.statements[1].id}/results`,
      404
    );
  });

  it('statement without rows does not create file', async function () {
    const b = await createBatchToCompletion({
      connectionId: connection.id,
      batchText: `SELECT 1 AS id WHERE 1 = 0`,
    });
    assert.equal(b.statements[0].resultsPath, null);
  });

  it('selectedText is honored', async function () {
    const b = await utils.post('admin', `/api/batches`, {
      connectionId: connection.id,
      batchText: `SELECT 1 AS id; SELECT 2 AS id;`,
      selectedText: `SELECT 2 AS id;`,
    });
    assert(b.id);
    assert.equal(b.statements.length, 1);
    assert.equal(b.statements[0].statementText, 'SELECT 2 AS id');
  });

  it('incomplete is captured', async function () {
    const b1 = await createBatchToCompletion({
      connectionId: connection.id,
      batchText: `SELECT 1 AS id UNION SELECT 2 AS id UNION SELECT 3 AS id UNION SELECT 4 AS id;`,
    });
    assert.equal(b1.statements[0].incomplete, true);
    assert.equal(b1.statements[0].rowCount, 3);
  });

  it('removing batch statement removes file', async function () {
    const b1 = await createBatchToCompletion({
      connectionId: connection.id,
      batchText: `SELECT 1 AS id UNION SELECT 2 AS id UNION SELECT 3 AS id UNION SELECT 4 AS id;`,
    });

    const statement = b1.statements[0];
    const dbPath = utils.config.get('dbPath');

    let exists = true;
    const fullPath = path.join(dbPath, statement.resultsPath);
    try {
      await access(fullPath);
    } catch (error) {
      exists = false;
    }
    assert(exists);

    await utils.models.statements.removeById(statement.id);

    try {
      await access(fullPath);
    } catch (error) {
      exists = false;
    }

    assert(!exists);
  });

  it('is removed on history cleanup', async function () {
    const b1 = await createBatchToCompletion({
      connectionId: connection.id,
      batchText: `SELECT 1 AS id UNION SELECT 2 AS id UNION SELECT 3 AS id UNION SELECT 4 AS id;`,
    });

    const statement = b1.statements[0];
    const dbPath = utils.config.get('dbPath');

    let exists = true;
    const fullPath = path.join(dbPath, statement.resultsPath);
    try {
      await access(fullPath);
    } catch (error) {
      exists = false;
    }
    assert(exists);

    // Ensure at least full second has passed for MySQL test (lacks subsecond data)
    await wait(1100);

    await utils.models.statements.removeOldEntries();

    try {
      await access(fullPath);
    } catch (error) {
      exists = false;
    }

    assert(!exists);
  });

  it('returns 413 on large payload', async function () {
    const singleQuery = `SELECT 1 AS id UNION SELECT 2 AS id UNION SELECT 3 AS id UNION SELECT 4 AS id;`;
    const bodyLimit = utils.config.get('bodyLimit');
    const maxPayload = bytes.parse(bodyLimit);
    // assuming UTF-8: one byte per ASCII char
    const numberOfQueries = maxPayload / singleQuery.length;
    let massiveQuery = ``;
    for (let i = 0; i < numberOfQueries; ++i) {
      massiveQuery = massiveQuery.concat(singleQuery);
    }
    await utils.post(
      'admin',
      `/api/batches`,
      {
        connectionId: connection.id,
        batchText: massiveQuery,
      },
      413
    );
  });

  it('creates batch and cancels it', async function () {
    batch = await utils.post('admin', `/api/batches`, {
      connectionId: asyncDriverConnection.id,
      queryId: asyncQuery.id,
      batchText: queryText,
      selectedText: queryText,
    });
    assert(batch.id);
    const response = await utils.put(
      'admin',
      `/api/batches/${batch.id}/cancel`,
      {
        connectionId: asyncDriverConnection.id,
      }
    );
    assert(response);
    assert.equal(response.status, 'cancelled');
    assert(response.statements);
    assert.equal(response.statements.length, 2);
    for (let s in response.statement) {
      if (s.hasOwnProperty('status')) {
        assert.equal(s.status, 'cancelled');
      } else {
        assert.fail('statement without status');
      }
    }
  });

  it('creates batch, tries to cancel it, and receives 400 when unsupported', async function () {
    batch = await utils.post('admin', `/api/batches`, {
      connectionId: connection.id,
      batchText: queryText,
      selectedText: queryText,
    });
    assert(batch.id);
    const response = await utils.put(
      'admin',
      `/api/batches/${batch.id}/cancel`,
      {
        connectionId: connection.id,
      },
      400
    );
    assert(response);
  });
});
