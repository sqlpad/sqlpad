const cassandra = require('cassandra-driver');
const { formatSchemaQueryResults } = require('../utils');

const id = 'cassandra';
const name = 'Cassandra';

const fields = [
  {
    key: 'contactPoints',
    formType: 'TEXT',
    label: 'Contact points (comma delimited)'
  },
  {
    key: 'localDataCenter',
    formType: 'TEXT',
    label: 'Local data center'
  },
  {
    key: 'keyspace',
    formType: 'TEXT',
    label: 'Keyspace'
  }
];

const SCHEMA_SQL = `
  SELECT 
    keyspace_name AS table_schema, 
    table_name, 
    column_name, 
    type AS data_type
  FROM 
    system_schema.columns;
`;

/**
 * Cassandra client needs to be shut down for either success or failure
 * @param {*} client
 */
function shutdownClient(client) {
  client
    .shutdown()
    .catch(error =>
      console.error('Error shutting down cassandra connection', error)
    );
}

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
async function runQuery(query, connection) {
  const { contactPoints, keyspace, localDataCenter, maxRows } = connection;

  const client = new cassandra.Client({
    contactPoints: contactPoints.split(',').map(cp => cp.trim()),
    // Unfamiliar with cassandra - docs mention datacenter1 and this works as a default so leaving it in
    // If someone familiar with cassandra can expand on this please do
    localDataCenter: localDataCenter || 'datacenter1',
    keyspace
  });

  try {
    const result = await client.execute(query, [], { fetchSize: maxRows });
    shutdownClient(client);
    const incomplete = result.rows && result.rows.length === maxRows;
    return { rows: result.rows, incomplete };
  } catch (error) {
    shutdownClient(client);
    throw error;
  }
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = 'select * from system.local;';
  return runQuery(query, connection);
}

/**
 * Get schema for connection
 * Cassandra driver doesn't accept MAX_SAFE_INTEGER as a fetch limit so we default to one million
 * @param {*} connection
 */
async function getSchema(connection) {
  connection.maxRows = 1000000;
  const queryResult = await runQuery(SCHEMA_SQL, connection);
  return formatSchemaQueryResults(queryResult);
}

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection
};
