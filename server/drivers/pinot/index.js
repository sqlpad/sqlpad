const sqlLimiter = require('sql-limiter');
const pinot = require('./_pinot');
const { formatSchemaQueryResults } = require('../utils');

const id = 'pinot';
const name = 'Apache Pinot';

const fields = [
  {
    key: 'controllerUrl',
    formType: 'TEXT',
    label: 'Controller URL', // ie http://localhost:9000
    description:
      'URL to Pinot controller containing protocol, host, and port. Example: http://localhost:9000',
  },
];

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
async function runQuery(query, connection) {
  const { maxRows } = connection;
  const maxRowsPlusOne = maxRows + 1;

  const limitedQuery = sqlLimiter.limit(query, ['limit'], maxRowsPlusOne);

  const { resultTable, exceptions } = await pinot.postSql(
    connection.controllerUrl,
    limitedQuery
  );

  if (exceptions && exceptions.length > 0) {
    throw new Error(exceptions[0].message);
  }

  // As of now return rows need to be an array of maps
  // Eventually when return format changes we can capture proper columns and data types in array format

  let rows = [];
  let incomplete = false;

  if (resultTable) {
    for (const row of resultTable.rows) {
      const rowMap = {};
      resultTable.dataSchema.columnNames.forEach((columnName, index) => {
        rowMap[columnName] = row[index];
      });
      rows.push(rowMap);
    }
  }

  if (rows.length >= maxRows) {
    incomplete = true;
    rows = rows.slice(0, maxRows);
  }

  return {
    rows,
    incomplete,
  };
}

/**
 * Test whether pinot broker is available / connection is configured correctly
 * @param {*} connection
 */
function testConnection(connection) {
  return pinot.getVersion(connection.controllerUrl);
}

/**
 * Get schema for connection
 * TODO FIXME: PInot does not have a concept of schema, but SQLPad requires it at this time
 * SQLPad needs to be updated to support optional table_schema
 * @param {*} connection
 */
async function getSchema(connection) {
  const columnRows = [];

  const { tables } = await pinot.getTables(connection.controllerUrl);

  for (const table of tables) {
    // eslint-disable-next-line no-await-in-loop
    const schema = await pinot.getTableSchema(connection.controllerUrl, table);
    for (const dimension of schema.dimensionFieldSpecs) {
      columnRows.push({
        table_schema: 'main',
        table_name: table,
        column_name: dimension.name,
        data_type: dimension.dataType,
        column_description: 'dimension',
      });
    }
    for (const metric of schema.metricFieldSpecs) {
      columnRows.push({
        table_schema: 'main',
        table_name: table,
        column_name: metric.name,
        data_type: metric.dataType,
        column_description: 'metric',
      });
    }
  }

  return formatSchemaQueryResults({ rows: columnRows });
}

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection,
};
