const assert = require('assert');
const bigquery = require('./index.js');

const connection = {
  name: 'test bigquery',
  driver: 'bigquery',
  projectId: process.env.BIGQUERY_TEST_GCP_PROJECT_ID,
  datasetName: process.env.BIGQUERY_TEST_DATASET_NAME,
  keyFile: process.env.BIGQUERY_TEST_CREDENTIALS_FILE,
  datasetLocation: process.env.BIGQUERY_TEST_DATASET_LOCATION,
  maxRows: 10
};

const testTable = 'sqlpad_test';
const dropTable = `DROP TABLE IF EXISTS ${connection.datasetName}.${testTable}`;
const createTable = `CREATE TABLE ${connection.datasetName}.${testTable} (id int64)`;
const inserts = `INSERT INTO ${connection.datasetName}.${testTable} (id) VALUES (1), (2), (3)`;
const testTimeoutMsecs = 15000;

describe('drivers/bigquery', function() {
  this.timeout(testTimeoutMsecs); // Set a large default timeout for all tests because BigQuery can be slow to respond.

  before(function(done) {
    if (
      connection.projectId &&
      connection.datasetName &&
      connection.keyFile &&
      connection.datasetLocation
    ) {
      bigquery
        .runQuery(dropTable, connection)
        .then(() => bigquery.runQuery(createTable, connection))
        .then(() => bigquery.runQuery(inserts, connection))
        .then(function() {
          done();
        });
    } else {
      console.log(
        'Define BIGQUERY_TEST_GCP_PROJECT_ID, BIGQUERY_TEST_DATASET_NAME, BIGQUERY_TEST_CREDENTIALS_FILE, and BIGQUERY_TEST_DATASET_LOCATION to run the bigquery driver tests'
      );
      this.skip();
    }
  });

  it('implements testConnection', function() {
    return bigquery.testConnection(connection).then(results => {
      assert(results, 'testConnection returns results');
      assert(!results.incomplete, 'testConnection results are marked complete');
    });
  });

  it('implements getSchema', function() {
    return bigquery.getSchema(connection).then(schemaInfo => {
      const schema = schemaInfo[connection.datasetName];
      const MSG = 'schema query returns expected results';

      assert(schema, MSG);
      assert(schema.hasOwnProperty(testTable), MSG);
      const columns = schema[testTable];
      assert.equal(columns.length, 1, MSG);
      assert.equal(columns[0].table_schema, connection.datasetName, MSG);
      assert.equal(columns[0].table_name, testTable, MSG);
      assert.equal(columns[0].column_name, 'id', MSG);
      assert.equal(columns[0].data_type, 'INTEGER', MSG);
    });
  });

  it('implements runQuery and reports successful queries as complete that return <= maxRows', function() {
    return bigquery
      .runQuery(
        `SELECT id FROM ${connection.datasetName}.${testTable} WHERE id = 1`,
        connection
      )
      .then(results => {
        assert(!results.incomplete, 'results should be marked complete');
        assert.equal(results.rows.length, 1, 'right number of rows');
      });
  });

  it('implements runQuery and reports successful queries as incomplete that return > maxRows', function() {
    const limitedConnection = { ...connection, maxRows: 2 };

    return bigquery
      .runQuery(
        `SELECT * FROM ${connection.datasetName}.${testTable}`,
        limitedConnection
      )
      .then(results => {
        assert(results.incomplete, 'results should be marked incomplete');
        assert.equal(results.rows.length, 2, 'right number of rows');
      });
  });

  it('implements runQuery and can run queries with no maxRows defined', function() {
    const connectionWithoutMaxRows = { ...connection };
    delete connectionWithoutMaxRows.maxRows;

    return bigquery
      .runQuery(
        `SELECT * FROM ${connection.datasetName}.${testTable}`,
        connectionWithoutMaxRows
      )
      .then(results => {
        assert(!results.incomplete, 'results should be marked complete');
        assert.equal(results.rows.length, 3, 'right number of rows');
      });
  });

  it('supports Standard SQL dialect by default', function() {
    return bigquery
      .runQuery(
        `SELECT CAST(id AS INT64) FROM ${connection.datasetName}.${testTable} WHERE id = 1`,
        connection
      )
      .then(results => {
        assert(results, 'returns results');
      });
  });

  it('throws errors for Legacy SQL', function() {
    let error;
    return bigquery
      .runQuery(
        `SELECT CAST(id AS INTEGER) FROM ${connection.datasetName}.${testTable} WHERE id = 1`,
        connection
      )
      .then(() => {
        assert.fail('An error should have been thrown for Legacy SQL.');
      })
      .catch(e => {
        error = e;
      })
      .then(() => {
        assert(
          error.toString().includes('Type not found'),
          'throws an exception'
        );
      });
  });

  it('returns descriptive error message for a missing table', function() {
    let error;
    return bigquery
      .runQuery(
        `SELECT * FROM ${connection.datasetName}.missing_table`,
        connection
      )
      .then(() => {
        assert.fail(
          'An error should have been thrown when referencing a missing table.'
        );
      })
      .catch(e => {
        error = e;
      })
      .then(() => {
        assert(
          error.toString().includes('was not found'),
          'throws the correct error'
        );
      });
  });

  it('returns descriptive error message for bad syntax', function() {
    let error;

    return bigquery
      .runQuery(
        `SELECT * FLARB ${connection.datasetName}.${testTable}`,
        connection
      )
      .then(() => {
        assert.fail('An error should have been thrown for bad syntax.');
      })
      .catch(e => {
        error = e;
      })
      .then(() => {
        assert(error, 'An error is thrown for bad syntax');
        assert(
          error.toString().includes('Syntax error'),
          'throws the correct error'
        );
      });
  });
});
