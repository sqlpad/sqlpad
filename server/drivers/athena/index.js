const appLog = require('../../lib/app-log');
const AWS = require('aws-sdk');
const athena = require('athena-express');
const sqlLimiter = require('sql-limiter');
const { formatSchemaQueryResults } = require('../utils');
const { resolvePositiveNumber } = require('../../lib/resolve-number');

const id = 'athena';
const name = 'Athena';
const asynchronous = true;

/**
 * Configure AWS.
 * @param {object} connection
 */
function configureAWS(connection) {
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
}

/**
 * Paginate AWS response.
 */
async function traverseAllPages(awsCall, extractor) {
  return new Promise((resolve, reject) => {
    let allResults = [];
    awsCall.eachPage((err, data) => {
      if (data) {
        allResults = allResults.concat(extractor(data));
        return true;
      } else if (err) {
        reject(new Error(`Could not fetch: ${err}`));
        return true;
      } else {
        resolve(allResults);
        return true;
      }
    });
  });
}

/**
 * Load Athena schema with Glue.
 * @param {object} connection
 */
async function getAthenaSchemaWithGlue(connection) {
  configureAWS(connection);

  const glue = new AWS.Glue();
  const databases = await traverseAllPages(
    glue.getDatabases(),
    (r) => r.DatabaseList || []
  );

  let tables = [];
  for (const database of databases) {
    let include = true;
    if (connection.athenaDatabaseInclusionPatterns) {
      include = false;
      for (const exclusionPattern of connection.athenaDatabaseInclusionPatterns.split(
        ','
      )) {
        if (RegExp(exclusionPattern).test(database.Name)) {
          include = true;
        }
      }
    }
    if (include) {
      tables = tables.concat(
        traverseAllPages(
          glue.getTables({ DatabaseName: database.Name }),
          (r) => r.TableList || []
        )
      );
    }
  }

  tables = (await Promise.all(tables)).flat();
  const schema = [];
  for (let table of tables) {
    for (const column of table['StorageDescriptor']['Columns']) {
      schema.push({
        table_schema: table['DatabaseName'],
        table_name: table['Name'],
        column_name: column['Name'],
        data_type: column['Type'],
      });
    }
  }

  return { rows: schema };
}

/**
 * Load Athena client.
 * @param {object} connection
 */
function newAthenaClient(connection) {
  configureAWS(connection);

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

  // Check to see if a custom maxrows is set, otherwise use default
  const maxRows = resolvePositiveNumber(
    connection.maxrows_override,
    connection.maxRows
  );
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
  // Check to see if a custom maxrows is set, otherwise use default
  const maxRows = resolvePositiveNumber(
    connection.maxrows_override,
    connection.maxRows
  );
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
  return getAthenaSchemaWithGlue(connection).then((queryResult) =>
    formatSchemaQueryResults(queryResult)
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
  {
    key: 'athenaDatabaseInclusionPatterns',
    formType: 'TEXT',
    label:
      'If set, only Athena databases which follow these regex patterns will be shown in the sidebar. ' +
      'The patterns must be separated by commas.',
  },
  {
    key: 'maxrows_override',
    formType: 'TEXT',
    label: 'Maximum rows to return',
    description: 'Optional',
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
