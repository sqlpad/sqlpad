import cassandra from 'cassandra-driver';
import appLog from '../../lib/app-log.js';
import { formatSchemaQueryResults } from '../utils.js';

const id = 'cassandra';
const name = 'Cassandra';

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
  client.shutdown().catch((error) => {
    appLog.error('Error shutting down cassandra connection');
    appLog.error(error);
  });
}

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
async function runQuery(query, connection) {
  const {
    contactPoints,
    keyspace,
    localDataCenter,
    maxRows,
    username,
    password,
  } = connection;
  const caConfig = {
    contactPoints: contactPoints.split(',').map((cp) => cp.trim()),
    // Unfamiliar with cassandra - docs mention datacenter1 and this works as a default so leaving it in
    // If someone familiar with cassandra can expand on this please do
    localDataCenter: localDataCenter || 'datacenter1',
    keyspace,
  };

  if (connection.username && connection.password) {
    caConfig['authProvider'] = new cassandra.auth.PlainTextAuthProvider(
      username,
      password
    );
  }

  const client = new cassandra.Client(caConfig);

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

const fields = [
  {
    key: 'contactPoints',
    formType: 'TEXT',
    label: 'Contact points (comma delimited)',
  },
  {
    key: 'localDataCenter',
    formType: 'TEXT',
    label: 'Local data center',
  },
  {
    key: 'keyspace',
    formType: 'TEXT',
    label: 'Keyspace',
  },
  {
    key: 'username',
    formType: 'TEXT',
    label: 'Database Username',
  },
  {
    key: 'password',
    formType: 'PASSWORD',
    label: 'Database Password',
  },
];

export default {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection,
};
