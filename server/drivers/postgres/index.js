const fs = require('fs');
const pg = require('pg');
const _ = require('lodash');
const PgCursor = require('pg-cursor');
const SocksConnection = require('socksjs');
const { formatSchemaQueryResults } = require('../utils');

const id = 'postgres';
const name = 'Postgres';

function createSocksConnection(connection) {
  if (connection.useSocks) {
    return new SocksConnection(
      {
        host: connection.host,
        port: connection.port
      },
      {
        host: connection.socksHost,
        port: connection.socksPort,
        user: connection.socksUsername,
        pass: connection.socksPassword
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
function runQuery(query, connection) {
  const pgConfig = {
    user: connection.username,
    password: connection.password,
    database: connection.database,
    host: connection.host,
    ssl: connection.postgresSsl,
    stream: createSocksConnection(connection),
    multipleStatements: !connection.denyMultipleStatements,
    preQueryStatements: connection.preQueryStatements
  };
  // TODO cache key/cert values
  if (connection.postgresKey && connection.postgresCert) {
    pgConfig.ssl = {
      key: fs.readFileSync(connection.postgresKey),
      cert: fs.readFileSync(connection.postgresCert)
    };
    if (connection.postgresCA) {
      pgConfig.ssl['ca'] = fs.readFileSync(connection.postgresCA);
    }
  }
  if (connection.port) pgConfig.port = connection.port;

  return new Promise((resolve, reject) => {
    const client = new pg.Client(pgConfig);
    let resultRows = [];

    client.connect(err => {
      if (err) {
        client.end();
        return reject(err);
      }

      function _runQuery(
        query,
        params = { addRowsToResults: true, closeConnection: true }
      ) {
        const cursor = client.query(new PgCursor(query));
        return cursor.read(connection.maxRows + 1, (err, rows) => {
          if (err) {
            // pg_cursor can't handle multi-statements at the moment
            // as a work around we'll retry the query the old way, but we lose the maxRows protection
            if (pgConfig.multipleStatements) {
              return client.query(query, (err, result) => {
                client.end();
                if (err) {
                  return reject(err);
                }
                if (params.addRowsToResults) {
                  // multi-statements returns array of result objects but runQuery should return rows array
                  // transform array of results objects to flat rows array
                  if (Array.isArray(result)) {
                    resultRows = resultRows.concat(
                      _.flatten(result.map(r => r.rows))
                    );
                  } else {
                    resultRows.push(result.rows);
                  }
                  return resolve({ rows: resultRows });
                }
              });
            } else {
              return reject(
                new Error('Running multiple statements not allowed')
              );
            }
          }
          let incomplete = false;
          if (rows.length === connection.maxRows + 1) {
            incomplete = true;
            rows.pop(); // get rid of that extra record. we only get 1 more than the max to see if there would have been more...
          }
          if (err) {
            reject(err);
          } else if (params.addRowsToResults) {
            resultRows = resultRows.concat(rows);
            resolve({ rows: resultRows, incomplete });
          }
          if (params.closeConnection) {
            cursor.close(err => {
              if (err) {
                console.log('error closing pg-cursor:');
                console.log(err);
              }
              // Calling end() without setImmediate causes error within node-pg
              setImmediate(() => {
                client.end(error => {
                  if (error) {
                    console.error(error);
                  }
                });
              });
            });
          }
        });
      }

      // Run pre query statements
      // Statements split by JS because Postgres multipleStatements maybe turned off
      if (pgConfig.preQueryStatements) {
        pgConfig.preQueryStatements
          .trim()
          .split(';')
          .forEach(q => {
            if (q)
              _runQuery(q, { addRowsToResults: false, closeConnection: false });
          });
      }

      // Run actual query
      _runQuery(query);
    });
  });
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
function getSchema(connection) {
  return runQuery(SCHEMA_SQL, connection).then(queryResult =>
    formatSchemaQueryResults(queryResult)
  );
}

const fields = [
  {
    key: 'host',
    formType: 'TEXT',
    label: 'Host/Server/IP Address'
  },
  {
    key: 'port',
    formType: 'TEXT',
    label: 'Port (optional)'
  },
  {
    key: 'database',
    formType: 'TEXT',
    label: 'Database'
  },
  {
    key: 'username',
    formType: 'TEXT',
    label: 'Database Username'
  },
  {
    key: 'password',
    formType: 'PASSWORD',
    label: 'Database Password'
  },
  {
    key: 'postgresSsl',
    formType: 'CHECKBOX',
    label: 'Use SSL'
  },
  {
    key: 'postgresCert',
    formType: 'TEXT',
    label: 'Database Certificate Path'
  },
  {
    key: 'postgresKey',
    formType: 'TEXT',
    label: 'Database Key Path'
  },
  {
    key: 'postgresCA',
    formType: 'TEXT',
    label: 'Database CA Path'
  },
  {
    key: 'useSocks',
    formType: 'CHECKBOX',
    label: 'Connect through SOCKS proxy'
  },
  {
    key: 'socksHost',
    formType: 'TEXT',
    label: 'Proxy hostname'
  },
  {
    key: 'socksPort',
    formType: 'TEXT',
    label: 'Proxy port'
  },
  {
    key: 'socksUsername',
    formType: 'TEXT',
    label: 'Username for socks proxy'
  },
  {
    key: 'socksPassword',
    formType: 'TEXT',
    label: 'Password for socks proxy'
  },
  {
    key: 'denyMultipleStatements',
    formType: 'CHECKBOX',
    label: 'Deny multiple statements per query'
  },
  {
    key: 'preQueryStatements',
    formType: 'TEXTAREA',
    label: 'Pre-query Statements (Optional)',
    placeholder:
      'Use to enforce session variables like:\n  SET statement_timeout = 15000;\n\nDeny multiple statements per query to avoid overwritten values.'
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
