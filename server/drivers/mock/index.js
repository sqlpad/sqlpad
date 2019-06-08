const _ = require('lodash');
const moment = require('moment');
const { formatSchemaQueryResults } = require('../utils');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const id = 'mock';
const name = 'Mock driver';

const fieldValues = {
  color: [
    'azure',
    'cyan',
    'indigo',
    'lime',
    'orchid',
    'red',
    'tan',
    'turquoise',
    'violet',
    'white'
  ],
  department: [
    'Automotive',
    'Beauty',
    'Computers',
    'Games',
    'Health',
    'Industrial',
    'Kids',
    'Music',
    'Shoes',
    'Toys'
  ],
  product: [
    'Awesome Wooden Ball',
    'Fantastic Rubber Tuna',
    'Generic Wooden Keyboard',
    'Handmade Granite Tuna',
    'Incredible Fresh Mouse',
    'Incredible Rubber Pants',
    'Refined Frozen Fish',
    'Rustic Concrete Chips',
    'Rustic Metal Bacon',
    'Unbranded Granite Shirt'
  ],
  orderdate: Array(500)
    .fill(true)
    .map((value, index) =>
      moment
        .utc('2019-01-01')
        .add(index, 'day')
        .toDate()
    ),
  orderdatetime: Array(500)
    .fill(true)
    .map((value, index) =>
      moment
        .utc('2019-01-01')
        .add(index, 'hour')
        .toDate()
    )
};

function cartesianify(rows, field) {
  const newRows = [];
  if (!rows.length) {
    field.values.forEach(value => {
      newRows.push({ [field.name]: value });
    });
  } else {
    rows.forEach(row => {
      field.values.forEach(value => {
        const newRow = Object.assign({}, row, { [field.name]: value });
        newRows.push(newRow);
      });
    });
  }

  return newRows;
}

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
async function runQuery(query, connection) {
  await wait(2000);

  // Connection here doesn't actually matter.
  // Someday this mock could get fancy and change output based on some connection value
  // For now validate that it is getting passed
  const { maxRows } = connection;

  // To determine the content of this mock query, inspect values from comments
  // Example format
  // -- dimensions = department 10, color 10, product 10, orderdate|orderdatetime 500
  // -- measures = cost, revenue, profit, <anythingyouwant>
  // -- orderby = department asc, product desc
  // -- limit = 100
  const dimensions = [];
  const measures = [];
  const orderByFields = [];
  const orderByDirections = [];
  let limit;

  query
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('--'))
    .map(line => line.replace('--', ''))
    .forEach(line => {
      const [fieldType, fieldData] = line
        .split('=')
        .map(p => p.trim().toLowerCase());

      if (!fieldData) {
        return;
      }

      // fieldData is something like <fieldname> <direction>, <field2> <direction>
      // or 100
      fieldData
        .split(',')
        .map(p => p.trim())
        .forEach(part => {
          if (fieldType === 'limit') {
            limit = parseInt(part);
          } else if (fieldType === 'dimensions') {
            const [fieldName, numString] = part.split(' ').map(p => p.trim());
            if (!fieldValues[fieldName]) {
              throw new Error(
                `Unknown ${fieldName}. must be one of: ${Object.keys(
                  fieldValues
                ).join(', ')}`
              );
            }
            dimensions.push({
              name: fieldName,
              values: fieldValues[fieldName].slice(0, parseInt(numString))
            });
          } else if (fieldType === 'measures') {
            measures.push(part);
          } else if (fieldType === 'orderby') {
            const [fieldName, direction] = part.split(' ').map(p => p.trim());
            if (!direction) {
              throw new Error('direction required. Must be asc or desc');
            }
            orderByFields.push(fieldName);
            orderByDirections.push(direction);
          } else {
            throw new Error(
              `Unknown ${fieldType}. Must be dimensions, measures, orderby, or limit`
            );
          }
        });
    });

  if (!dimensions.length) {
    throw new Error('dimensions required');
  }

  // Assemble dimensions and things
  let rows = [];
  dimensions.forEach(dimension => {
    rows = cartesianify(rows, dimension);
  });

  if (measures.length) {
    rows.forEach(row => {
      measures.forEach(measure => {
        const date = row.orderdate || row.orderdatetime;
        if (date) {
          const doy = moment.utc(date).dayOfYear();
          row[measure] = 10 + Math.round(doy * Math.random());
        } else {
          row[measure] = Math.round(Math.random() * 1000);
        }
      });
    });
  }

  if (orderByFields.length) {
    rows = _.orderBy(rows, orderByFields, orderByDirections);
  }

  if (limit) {
    rows = rows.slice(0, limit);
  }

  return { rows: rows.slice(0, maxRows), incomplete: rows.length > maxRows };
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = `
    -- dimensions = department 1
    -- measures = price
  `;
  return runQuery(query, connection);
}

const schemaRows = [];
const columns = [
  { name: 'product', type: 'TEXT', description: 'item sold' },
  { name: 'color', type: 'TEXT', description: 'color of item' },
  { name: 'department', type: 'TEXT', description: 'department of sale' },
  { name: 'orderdate', type: 'TIMESTAMP', description: 'date of order' },
  {
    name: 'orderdatetime',
    type: 'TIMESTAMP',
    description: 'date and time of order'
  }
];
Array(500)
  .fill(true)
  .forEach((value, tableIndex) => {
    columns.forEach(column => {
      schemaRows.push({
        table_schema: 'public',
        table_name: 'fake_sales_table_' + tableIndex,
        column_name: column.name,
        data_type: column.type,
        column_description: column.description
      });
    });
  });

/**
 * Get schema for connection
 */
async function getSchema() {
  const fakeSchemaQueryResult = {
    rows: schemaRows,
    incomplete: false
  };
  await wait(Math.random() * 5000);
  return formatSchemaQueryResults(fakeSchemaQueryResult);
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
];

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection
};
