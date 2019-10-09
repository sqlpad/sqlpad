const assert = require('assert');
const mock = require('./index.js');

const connection = {
  name: 'test postgres',
  driver: 'mock',
  host: 'localhost',
  database: 'sqlpad',
  username: 'sqlpad',
  password: 'sqlpad',
  maxRows: 100
};

describe('drivers/mock', function() {
  it('tests connection', function() {
    return mock.testConnection(connection);
  });

  it('getSchema()', function() {
    return mock.getSchema(connection).then(schemaInfo => {
      // Should probably create tables and validate them here
      // For now this is a smoke test of sorts
      assert(schemaInfo);
    });
  });

  it('runQuery under limit', function() {
    const c = { ...connection, maxRows: 10000 };
    const query = `
      -- dimensions = product 5
    `;
    return mock.runQuery(query, c).then(results => {
      assert(!results.incomplete, 'not incomplete');
      assert.equal(results.rows.length, 5, 'row length');
    });
  });

  it('runQuery over limit', function() {
    const c = { ...connection, maxRows: 10 };
    const query = `
      -- dimensions = product 10, color 10, orderdate 500
    `;
    return mock.runQuery(query, c).then(results => {
      assert(results.incomplete, 'incomplete');
      assert.equal(results.rows.length, 10, 'row length');
    });
  });
});
