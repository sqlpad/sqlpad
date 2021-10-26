const appLog = require('../../lib/app-log');
const AWS = require('aws-sdk');
const athena = require('athena-express');
const sqlLimiter = require('sql-limiter');
const { formatSchemaQueryResults } = require('../utils');

const id = 'athena';
const name = 'Athena';
const asynchronous = true;

// Not very elegant but is compatible with Athena v1 and v2
const SCHEMA_SQL_INFORMATION_SCHEMA = `

  SELECT
    c.table_schema as table_schema,
    c.table_name as table_name,
    c.column_name as column_name,
    CASE WHEN regexp_like(c.extra_info, 'partition key')
    THEN
      c.data_type || ' (partitioned)'
    ELSE
      c.data_type
    END as data_type
  FROM
    INFORMATION_SCHEMA.columns c
  WHERE
    c.table_schema NOT IN ('INFORMATION_SCHEMA', 'information_schema')
  ORDER BY
    c.table_schema,
    c.table_name,
    c.ordinal_position
`;

/**
 * Load Athena client.
 * @param {object} connection
 */
function newAthenaClient(connection) {
  if (connection.awsAccessKeyId && connection.awsSecretAccessKey) {
    const awsCredentials = {
      region: connection.awsRegion,
      accessKeyId: connection.awsAccessKeyId,
      secretAccessKey: connection.awsSecretAccessKey,
    };
    AWS.config.update(awsCredentials);
  } else {
    AWS.config.update({ region: awsCredential.region });
  }

  const athenaExpressConfig = {
    aws: AWS,
    s3: connection.athenaStagingDirectory,
    workgroup: connection.athenaWorkgroup || 'primary',
    ignoreEmpty: false,
    waitForResults: false,
  };
  return new athena.AthenaExpress(athenaExpressConfig);
}

/**
 * Run query for connection and return execution ID to enable query cancellation
 * Should return execution ID
 * @param {string} queryString
 * @param {object} connection
 */
function startQueryExecution(queryString, connection = {}) {
  const athenaClient = newAthenaClient(connection);

  const maxRows = connection.maxRows;
  const maxRowsPlusOne = maxRows + 1;
  const limitedQuery = sqlLimiter.limit(queryString, ['limit'], maxRowsPlusOne);

  appLog.trace(limitedQuery);
  return athenaClient
    .query({ sql: limitedQuery })
    .then((results) => {
      return results.QueryExecutionId;
    })
    .catch((error) => {
      appLog.error(`Error found ${error}`);
      throw error;
    });
}

/**
 * Run query for connection and return the results
 * Should return the query results
 * @param {string} executionId
 * @param {object} connection
 */
function runQuery(executionId, connection = {}) {
  const maxRows = connection.maxRows;
  const maxRowsPlusOne = maxRows + 1;
  const athenaClient = newAthenaClient(connection);

  return athenaClient
    .query(executionId)
    .then((results) => {
      appLog.trace(results);
      if (!results.Items) {
        return { results, incomplete: false };
      }
      appLog.debug(
        `Retrieved ${results.Items.length} items out of ${results.Count}`
      );
      let rows = results.Items;
      if (rows.length >= maxRowsPlusOne) {
        return { rows: rows.slice(0, maxRows), incomplete: true };
      }
      return { rows, incomplete: false };
    })
    .catch((error) => {
      appLog.error(`Error found ${error}`);
      if (
        String(error).includes('Insufficient Lake Formation permission(s) on')
      ) {
        throw Error(
          "Table not found, make sure you're using a fully qualified table name, e.g. database.table"
        );
      }
      throw error;
    });
}

/**
 * Cancels a query matching exeuction ID
 * @param {string} executionId
 * @param {*} connection
 */
function cancelQuery(executionId, connection = {}) {
  if (connection.awsAccessKeyId && connection.awsSecretAccessKey) {
    const awsCredentials = {
      region: connection.awsRegion,
      accessKeyId: connection.awsAccessKeyId,
      secretAccessKey: connection.awsSecretAccessKey,
    };
    AWS.config.update(awsCredentials);
  } else {
    AWS.config.update({ region: connection.awsRegion });
  }
  const athena = new AWS.Athena();

  const params = {
    QueryExecutionId: executionId,
  };
  athena.stopQueryExecution(params, function (err) {
    if (err) {
      appLog.error(err);
      throw err;
    }
  });

  return true;
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = `SELECT 1`;
  return startQueryExecution(query, connection).then((executionId) => {
    appLog.error(executionId);
    runQuery(executionId, connection);
  });
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  return startQueryExecution(SCHEMA_SQL_INFORMATION_SCHEMA, connection)
    .then((executionId) => runQuery(executionId, connection))
    .then((queryResult) => formatSchemaQueryResults(queryResult));
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
    label:
      'AWS Access Key ID. Leave blank if you want to use the instance profile instead',
  },
  {
    key: 'awsSecretAccessKey',
    formType: 'TEXT',
    label:
      'AWS Secret Access Key. Leave blank if you want to use the instance profile instead',
  },
  {
    key: 'athenaStagingDirectory',
    formType: 'TEXT',
    label: 'Athena Staging Directory',
  },
  {
    key: 'athenaWorkgroup',
    formType: 'TEXT',
    label: 'Athena Workgroup. Optional, defaults to "primary"',
  },
];

module.exports = {
  id,
  name,
  asynchronous,
  fields,
  getSchema,
  runQuery,
  startQueryExecution,
  cancelQuery,
  testConnection,
};
