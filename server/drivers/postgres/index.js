const fs = require('fs');
const pg = require('pg');
const _ = require('lodash');
const PgCursor = require('pg-cursor');
const SocksConnection = require('socksjs');
const appLog = require('../../lib/app-log');
const splitSql = require('../../lib/split-sql');
const { formatSchemaQueryResults } = require('../utils');

const id = 'postgres';
const name = 'Postgres';

/**
 * A promise wrapper for pgCursor
 * Regular use case of cursors is to fetch chunks at a time
 * SQLPad uses them as a way to confidently get a set number of rows without relying on using LIMIT in a SQL query.
 * The cursor is then closed after first result is received
 * @param {pg.Client} client
 * @param {string} query
 * @param {number} rows
 */
function asyncQueryViaCursor(cursor, rows) {
  return new Promise((resolve, reject) => {
    cursor.read(rows, (err, rows) => {
      cursor.close((closeError) => {
        if (closeError) {
          appLog.error(closeError, 'Error closing postgres cursor');
        }
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  });
}

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
      ssl: connection.postgresSsl,
      stream: createSocksConnection(connection),
    };

    // TODO cache key/cert values
    if (connection.postgresKey && connection.postgresCert) {
      pgConfig.ssl = {
        key: fs.readFileSync(connection.postgresKey),
        cert: fs.readFileSync(connection.postgresCert),
      };
      if (connection.postgresCA) {
        pgConfig.ssl['ca'] = fs.readFileSync(connection.postgresCA);
      }
    }

    this.pgConfig = pgConfig;
    this.client = new pg.Client(pgConfig);

    await this.client.connect();

    if (connection.preQueryStatements) {
      const queries = splitSql(connection.preQueryStatements);
      for (const query of queries) {
        // eslint-disable-next-line no-await-in-loop
        await this.runQuery(query);
      }
    }
  }

  async disconnect() {
    if (this.client) {
      const client = this.client;
      this.client = null;
      try {
        await client.end();
      } catch (error) {
        appLog.error(error, 'Error ending postgres client');
      }
    }
  }

  async runQuery(query) {
    let incomplete = false;
    const { maxRows } = this.connection;
    const maxRowsPlusOne = maxRows + 1;

    if (this.connection.denyMultipleStatements) {
      const statements = splitSql(query);
      if (statements.length > 1) {
        throw new Error('Running multiple statements not allowed');
      }
    }

    try {
      const cursor = this.client.query(new PgCursor(query));

      let resultRows = await asyncQueryViaCursor(cursor, maxRowsPlusOne);

      if (resultRows.length === maxRowsPlusOne) {
        incomplete = true;
        resultRows.pop(); // get rid of that extra record. we only get 1 more than the max to see if there would have been more...
      }
      return { rows: resultRows, incomplete };
    } catch (error) {
      // pg_cursor can't handle multi-statements at the moment
      // as a work around we'll retry the query the old way, but we lose the maxRows protection

      // Run query without try/catch here
      // The error should throw and buble up
      const result = await this.client.query(query);

      // multi-statements returns array of result objects but runQuery should return rows array
      // transform array of results objects to flat rows array
      let resultRows = [];
      if (Array.isArray(result)) {
        resultRows = resultRows.concat(_.flatten(result.map((r) => r.rows)));
      } else {
        resultRows = resultRows.rows || [];
      }

      if (resultRows.length >= maxRows) {
        incomplete = true;
        resultRows = resultRows.slice(0, maxRows);
      }

      return { rows: resultRows, incomplete };
    }
  }
}

function createSocksConnection(connection) {
  if (connection.useSocks) {
    return new SocksConnection(
      {
        host: connection.host,
        port: connection.port,
      },
      {
        host: connection.socksHost,
        port: connection.socksPort,
        user: connection.socksUsername,
        pass: connection.socksPassword,
      }
    );
  }
}

const SCHEMA_SQL = `
  select 
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
    attr.attnum
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
    key: 'postgresSsl',
    formType: 'CHECKBOX',
    label: 'Use SSL',
  },
  {
    key: 'postgresCert',
    formType: 'TEXT',
    label: 'Database Certificate Path',
  },
  {
    key: 'postgresKey',
    formType: 'TEXT',
    label: 'Database Key Path',
  },
  {
    key: 'postgresCA',
    formType: 'TEXT',
    label: 'Database CA Path',
  },
  {
    key: 'useSocks',
    formType: 'CHECKBOX',
    label: 'Connect through SOCKS proxy',
  },
  {
    key: 'socksHost',
    formType: 'TEXT',
    label: 'Proxy hostname',
  },
  {
    key: 'socksPort',
    formType: 'TEXT',
    label: 'Proxy port',
  },
  {
    key: 'socksUsername',
    formType: 'TEXT',
    label: 'Username for socks proxy',
  },
  {
    key: 'socksPassword',
    formType: 'TEXT',
    label: 'Password for socks proxy',
  },
  {
    key: 'denyMultipleStatements',
    formType: 'CHECKBOX',
    label: 'Deny multiple statements per query',
  },
  {
    key: 'preQueryStatements',
    formType: 'TEXTAREA',
    label: 'Pre-query Statements (Optional)',
    placeholder:
      'Use to enforce session variables like:\n  SET statement_timeout = 15000;\n\nDeny multiple statements per query to avoid overwritten values.',
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
