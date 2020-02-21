const { BigQuery } = require('@google-cloud/bigquery');
const { formatSchemaQueryResults } = require('../utils');
const config = require('../../lib/config');

const id = 'bigquery';
const name = 'BigQuery';
const timeoutSeconds = config.get('timeoutSeconds'); // This is the HTTP connection timeout used by the SQLPad backend

/**
 * Return BiqQuery API object.
 * @param {object} connection
 */
function newBigQuery(connection) {
  return new BigQuery({
    projectId: connection.projectId,
    keyFilename: connection.keyFile,
    // Location must match that of the dataset(s) referenced in the query.
    location: connection.datasetLocation
  });
}

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} queryString
 * @param {object} connection
 */
function runQuery(queryString, connection = {}) {
  const bigquery = newBigQuery(connection);
  let incomplete = false;
  const t1 = process.hrtime();

  const isMaxRowsSpecified =
    connection.hasOwnProperty('maxRows') && connection.maxRows !== null;

  const query = {
    query: queryString
  };

  if (connection.datasetName) {
    query.defaultDataset = { datasetId: connection.datasetName };
  }

  // TODO: should maxRows apply to non-SELECT statements?
  return bigquery
    .createQueryJob(query)
    .then(([job]) => {
      // Wait for the query to finish.
      const options = { timeoutMs: timeoutSeconds * 1000 };
      if (isMaxRowsSpecified) {
        options.maxResults = connection.maxRows + 1;
      }
      return job.getQueryResults(options);
    })
    .then(([rows]) => {
      if (rows.length === 0) {
        const t2 = process.hrtime(t1);
        if (t2[0] >= timeoutSeconds) {
          throw new Error(`Query timed out after ${timeoutSeconds} seconds.`);
        }
      }

      if (isMaxRowsSpecified && rows.length > connection.maxRows) {
        rows.splice(connection.maxRows);
        incomplete = true;
      }

      return {
        incomplete,
        rows
      };
    });
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = `SELECT * FROM \`${connection.datasetName}.__TABLES_SUMMARY__\` LIMIT 1`;
  return runQuery(query, connection);
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  const bigquery = newBigQuery(connection);

  const query = {
    query: `SELECT * FROM \`${connection.datasetName}.__TABLES__\``,
    // Location must match that of the dataset(s) referenced in the query.
    location: connection.datasetLocation
  };

  return bigquery
    .createQueryJob(query)
    .then(([job]) => {
      // Waits for the query to finish
      return job.getQueryResults();
    })
    .then(([tables]) => {
      const promises = [];
      for (let table of tables) {
        promises.push(
          bigquery
            .dataset(connection.datasetName)
            .table(table.table_id)
            .getMetadata()
        );
      }
      return Promise.all(promises);
    })
    .then(tables => {
      const tableSchema = {
        rows: []
      };
      for (let table of tables) {
        const tableInfo = table[0];
        if (tableInfo.kind !== 'bigquery#table') continue; // eslint-disable-line no-continue
        const datasetId = tableInfo.tableReference.datasetId;
        const tableId = tableInfo.tableReference.tableId;
        const fields = tableInfo.schema.fields;
        for (let field of fields) {
          tableSchema.rows.push({
            table_schema: datasetId,
            table_name: tableId,
            column_name: field.name,
            data_type: field.type
          });
        }
      }
      return formatSchemaQueryResults(tableSchema);
    });
}

const fields = [
  {
    key: 'projectId',
    formType: 'TEXT',
    label: 'Google Cloud Console Project ID'
  },
  {
    key: 'keyFile',
    formType: 'TEXT',
    label: 'JSON Keyfile for Service Account'
  },
  {
    key: 'datasetName',
    formType: 'TEXT',
    label: 'Dataset to use'
  },
  {
    key: 'datasetLocation',
    formType: 'TEXT',
    label: 'Location for this Dataset'
  }
];

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection
};
