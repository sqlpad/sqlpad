const faker = require('faker')
const { formatSchemaQueryResults } = require('../utils')

const id = 'mock'
const name = 'Mock driver'

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
async function runQuery(query, connection) {
  // Connection here doesn't actually matter.
  // Someday this mock could get fancy and change output based on some connection value
  // For now validate that it is getting passed
  const { maxRows } = connection
  const rows = []

  // const departments = Array(5)
  //   .fill(1)
  //   .map(faker.commerce.department())

  // const colors = Array(3)

  for (let i = 0; i < 1000; i++) {
    rows.push({
      department: faker.commerce.department(),
      color: faker.commerce.color(),
      price: faker.commerce.price()
    })
  }

  return { rows: rows.slice(0, maxRows), incomplete: rows.length > maxRows }
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = "SELECT 'success' AS TestQuery;"
  return runQuery(query, connection)
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  const fakeSchemaQueryResult = {
    rows: [
      {
        table_schema: 'public',
        table_name: 'foo_table',
        column_name: 'foo_column',
        data_type: 'INTEGER',
        column_description: 'This is a description.'
      }
    ],
    incomplete: false
  }
  return Promise.resolve(() => formatSchemaQueryResults(fakeSchemaQueryResult))
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
    key: 'useSsl',
    formType: 'CHECKBOX',
    label: 'Use SSL'
  },
  {
    key: 'certPath',
    formType: 'TEXT',
    label: 'Database Certificate Path'
  },
  {
    key: 'keyPath',
    formType: 'TEXT',
    label: 'Database Key Path'
  },
  {
    key: 'caPath',
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
  }
]

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection
}
