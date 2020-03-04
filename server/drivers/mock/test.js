const assert = require('assert');
const mock = require('./index.js');

const connection = {
  name: 'test postgres',
  driver: 'mock',
  host: 'localhost',
  database: 'sqlpad',
  username: 'sqlpad',
  password: 'sqlpad',
  maxRows: 100,
  wait: 0
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

  it('Client cannot connect more than once', async function() {
    const client = new mock.Client(connection);
    await client.connect();
    await assert.rejects(client.connect());
    await client.disconnect();
  });

  it('Client handles multiple disconnects', async function() {
    const client = new mock.Client(connection);
    await client.connect();
    await client.disconnect();
    await client.disconnect();
  });

  it('Client handles multiple runQuery calls', async function() {
    const client = new mock.Client(connection);
    await client.connect();

    const results1 = await client.runQuery(`
      -- dimensions = product 1, color 1, orderdate 10
    `);
    assert.equal(results1.incomplete, false);
    assert.equal(results1.rows.length, 10);
    const results2 = await client.runQuery(`
    -- dimensions = product 1, color 1, orderdate 10
  `);
    assert.equal(results2.incomplete, false);
    assert.equal(results2.rows.length, 10);

    await client.disconnect();
  });
});
