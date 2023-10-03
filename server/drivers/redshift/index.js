const fs = require('fs');
const pg = require('pg');
const sqlLimiter = require('sql-limiter');
const appLog = require('../../lib/app-log');
const { formatSchemaQueryResults } = require('../utils');

const id = 'redshift';
const name = 'Redshift';

class Client {
  constructor(connection) {
    this.connection = connection;
    this.client = null;
  }

  async connect() {
    if (this.client) {
      throw new Error('Client already connected');
    }

    const connection = this.connection;

    const pgConfig = {
      user: connection.username,
      password: connection.password,
      database: connection.database,
      host: connection.host,
      port: connection.port || undefined,
      ssl: connection.ssl,
    };

    // TODO cache key/cert values
    if (connection.keyPath && connection.certPath) {
      pgConfig.ssl = {
        key: fs.readFileSync(connection.keyPath),
        cert: fs.readFileSync(connection.certPath),
      };
      if (connection.caPath) {
        pgConfig.ssl['ca'] = fs.readFileSync(connection.caPath);
      }
    }

    this.pgConfig = pgConfig;
    this.client = new pg.Client(pgConfig);

    await this.client.connect();
  }

  async disconnect() {
    if (this.client) {
      const client = this.client;
      this.client = null;
      try {
        await client.end();
      } catch (error) {
        appLog.error(error, 'Error ending Redshift client');
      }
    }
  }

  async runQuery(query) {
    let incomplete = false;
    const { maxRows } = this.connection;
    const maxRowsPlusOne = maxRows + 1;

    const limitedQuery = sqlLimiter.limit(
      query,
      ['limit', 'fetch'],
      maxRowsPlusOne
    );

    // Run query without try/catch here
    // The error should throw and buble up
    const result = await this.client.query(limitedQuery);

    // multi-statements returns array of result objects but runQuery should return rows array
    // transform array of results objects to flat rows array
    let resultRows = result.rows || [];
    if (resultRows.length >= maxRows) {
      incomplete = true;
      resultRows = resultRows.slice(0, maxRows);
    }

    return { rows: resultRows, incomplete };
  }
}

const SCHEMA_SQL = `
  select 
    schemaname as table_schema,
    tablename as table_name,
    columnname as column_name,
    external_type as data_type,
    'no description' as column_description
  from 
    SVV_EXTERNAL_COLUMNS
  
  union all
  
  select 
    table_schema,
    table_name,
    column_name,
    data_type,
    column_description
  from
    (select 
        ns.nspname as table_schema,
        cls.relname as table_name,
        attr.attname as column_name,
        trim(leading '_' from tp.typname) as data_type,
        pg_catalog.col_description(attr.attrelid, attr.attnum) as column_description
    from 
        pg_catalog.pg_attribute as attr
        join pg_catalog.pg_class as cls on cls.oid = attr.attrelid
        join pg_catalog.pg_namespace as ns on ns.oid = cls.relnamespace
        join pg_catalog.pg_type as tp on tp.typelem = attr.atttypid
    where 
        cls.relkind in ('r', 'v', 'm')
        and ns.nspname not in ('pg_catalog', 'pg_toast', 'information_schema')
        and not attr.attisdropped 
        and attr.attnum > 0
    order by 
        ns.nspname,
        cls.relname,
        attr.attnum)
`;

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
async function runQuery(query, connection) {
  const client = new Client(connection);
  await client.connect();
  try {
    const result = await client.runQuery(query);
    await client.disconnect();
    return result;
  } catch (error) {
    await client.disconnect();
    throw error;
  }
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = "SELECT 'success' AS TestQuery;";
  return runQuery(query, connection);
}

/**
 * Get schema for connection
 * @param {*} connection
 */
async function getSchema(connection) {
  const queryResult = await runQuery(SCHEMA_SQL, connection);
  return formatSchemaQueryResults(queryResult);
}

const fields = [
  {
    key: 'host',
    formType: 'TEXT',
    label: 'Host/Server/IP Address',
  },
  {
    key: 'port',
    formType: 'TEXT',
    label: 'Port (optional)',
  },
  {
    key: 'database',
    formType: 'TEXT',
    label: 'Database',
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
  {
    key: 'ssl',
    formType: 'CHECKBOX',
    label: 'Use SSL',
  },
  {
    key: 'certPath',
    formType: 'TEXT',
    label: 'Database Certificate Path',
  },
  {
    key: 'keyPath',
    formType: 'TEXT',
    label: 'Database Key Path',
  },
  {
    key: 'caPath',
    formType: 'TEXT',
    label: 'Database CA Path',
  },
];

module.exports = {
  Client,
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection,
};
