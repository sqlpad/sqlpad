const { BigQuery } = require('@google-cloud/bigquery');
const { formatSchemaQueryResults } = require('../utils');
const minimist = require('minimist');

const id = 'bigquery';
const name = 'BigQuery';

/**
 * Return the query timeout in seconds from the app config.
 */
let _timeoutSeconds;
function getTimeoutSeconds() {
  if (!_timeoutSeconds) {
    const Config = require('../../lib/config');
    const argv = minimist(process.argv.slice(2));
    const config = new Config(argv, process.env);
    _timeoutSeconds = config.get('timeoutSeconds'); // This is the HTTP connection timeout used by the SQLPad backend
  }
  return _timeoutSeconds;
}

/**
 * Split the dataset names from the connection info.
 * @param {string} datasets
 */
function splitDatasets(datasets) {
  return datasets.split(',').map(name => name.trim());
}

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
  const timeoutSeconds = getTimeoutSeconds() - 1; // A little less than the SQLPad timeout
  const bigquery = newBigQuery(connection);
  let incomplete = false;
  const t1 = process.hrtime();

  const isMaxRowsSpecified =
    connection.hasOwnProperty('maxRows') && connection.maxRows !== null;

  const query = {
    query: queryString
  };

  const datasets = splitDatasets(connection.datasetName);
  // Set the default dataset if only one dataset is present.
  if (datasets.length === 1) {
    query.defaultDataset = { datasetId: datasets[0] };
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
  const datasets = splitDatasets(connection.datasetName);
  const query = `SELECT * FROM \`${datasets[0]}.__TABLES_SUMMARY__\` LIMIT 1`;
  return runQuery(query, connection);
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  const bigquery = newBigQuery(connection);

  const queries = splitDatasets(connection.datasetName).map(
    name => `SELECT * FROM \`${name}.__TABLES__\``
  );

  const query = {
    query: queries.join(' UNION ALL '),
    // Location must match that of the dataset(s) referenced in the query.
    location: connection.datasetLocation
  };

  return bigquery
    .createQueryJob(query)
    .then(([job]) =>
      // Waits for the query to finish
      job.getQueryResults()
    )
    .then(([tables]) =>
      Promise.all(
        tables.map(table =>
          bigquery
            .dataset(table.dataset_id)
            .table(table.table_id)
            .getMetadata()
        )
      )
    )
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
    label: 'Datasets set to use. Comma separate names.'
  },
  {
    key: 'datasetLocation',
    formType: 'TEXT',
    label: 'Location for the datasets, e.g. US'
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
