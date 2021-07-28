const AWS = require('aws-sdk');
const athena = require('athena-express');
const sqlLimiter = require('sql-limiter');
const { formatSchemaQueryResults } = require('../utils');

const id = 'athena';
const name = 'Athena';

const SCHEMA_SQL_INFORMATION_SCHEMA = `
    SELECT c.table_schema AS table_schema,
        c.table_name AS table_name,
        c.column_name AS column_name,
        c.data_type AS data_type
    FROM information_schema.columns c
    WHERE lower(c.table_schema) <> 'information_schema'
    ORDER BY c.table_schema,
        c.table_name,
        c.ordinal_position
`;

/**
 * Load Athena client.
 * @param {object} connection
 */
function newAthenaClient(connection) {
  const awsCredentials = {
    region: connection.awsRegion,
    accessKeyId: connection.awsAccessKeyId,
    secretAccessKey: connection.awsSecretAccessKey,
  };
  AWS.config.update(awsCredentials);

  const athenaExpressConfig = {
    aws: AWS,
    s3: connection.athenaStagingDirectory,
    workgroup: connection.athenaWorkgroup,
  };
  return new athena.AthenaExpress(athenaExpressConfig);
}

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} queryString
 * @param {object} connection
 */
function runQuery(queryString, connection = {}) {
  const athenaClient = newAthenaClient(connection);

  const maxRows = connection.maxRows;
  const maxRowsPlusOne = maxRows + 1;
  const limitedQuery = sqlLimiter.limit(queryString, ['limit'], maxRowsPlusOne);

  return athenaClient
    .query({ sql: limitedQuery })
    .then((results) => {
      let rows = results.Items;
      if (rows.length >= maxRowsPlusOne) {
        return { rows: rows.slice(0, maxRows), incomplete: true };
      }
      return { rows, incomplete: false };
    })
    .catch((error) => {
      throw error;
    });
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = `SELECT 1`;
  return runQuery(query, connection);
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  return runQuery(SCHEMA_SQL_INFORMATION_SCHEMA, connection).then(
    (queryResult) => formatSchemaQueryResults(queryResult)
  );
}

const fields = [
  {
    key: 'awsRegion',
    formType: 'TEXT',
    label: 'AWS Region',
  },
  {
    key: 'awsAccessKeyId',
    formType: 'TEXT',
    label: 'AWS Access Key ID',
  },
  {
    key: 'awsSecretAccessKey',
    formType: 'TEXT',
    label: 'AWS Secret Access Key',
  },
  {
    key: 'athenaStagingDirectory',
    formType: 'TEXT',
    label: 'Athena Staging Directory',
  },
  {
    key: 'athenaWorkgroup',
    formType: 'TEXT',
    label: 'Athena Workgroup',
  },
];

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection,
};
