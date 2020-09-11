const assert = require('assert');
const testUtils = require('../test-utils.js');
const redshift = require('./index.js');

const connection = {
  name: 'test postgres',
  driver: 'postgres',
  host: 'localhost',
  database: 'sqlpad',
  username: 'sqlpad',
  password: 'sqlpad',
  maxRows: 100,
};

// redshift is postgres-compatible, but the schema query is different
// A local postgres is used for testing, the schema query is skipped.
describe('drivers/fake-redshift', function () {
  before(async function () {
    await redshift.runQuery('DROP TABLE IF EXISTS sqlpad_test;', connection);
    await redshift.runQuery(
      'CREATE TABLE sqlpad_test (id INT, name TEXT);',
      connection
    );
  });

  it('tests connection', function () {
    return redshift.testConnection(connection);
  });

  it.skip('getSchema()', function () {
    return redshift.getSchema(connection).then((schemaInfo) => {
      testUtils.hasColumnDataType(
        schemaInfo,
        'public',
        'sqlpad_test',
        'id',
        'int4'
      );
    });
  });

  it('runQuery under limit', function () {
    return redshift
      .runQuery('SELECT * FROM generate_series(1, 10) gs;', connection)
      .then((results) => {
        assert(!results.incomplete, 'not incomplete');
        assert.equal(results.rows.length, 10, 'row length');
      });
  });

  it('runQuery over limit', function () {
    return redshift
      .runQuery('SELECT * FROM generate_series(1, 9000) gs;', connection)
      .then((results) => {
        assert(results.incomplete, 'incomplete');
        assert.equal(results.rows.length, 100, 'row length');
      });
  });

  it('Client cannot connect more than once', async function () {
    const client = new redshift.Client(connection);
    await client.connect();
    await assert.rejects(client.connect());
    await client.disconnect();
  });

  it('Client handles multiple disconnects', async function () {
    const client = new redshift.Client(connection);
    await client.connect();
    await client.disconnect();
    await client.disconnect();
  });

  it('Client handles multiple runQuery calls', async function () {
    const client = new redshift.Client(connection);
    await client.connect();

    const results1 = await client.runQuery(
      'SELECT * FROM generate_series(1, 10) g1'
    );
    assert.equal(results1.incomplete, false);
    assert.equal(results1.rows.length, 10);
    const results2 = await client.runQuery(
      'SELECT * FROM generate_series(1, 10) g1'
    );
    assert.equal(results2.incomplete, false);
    assert.equal(results2.rows.length, 10);

    await client.disconnect();
  });

  it('Throws helpful error', async function () {
    let error;
    try {
      await redshift.runQuery('SELECT * FROM fake_table', connection);
    } catch (e) {
      error = e;
    }
    assert(error);
    assert(
      error.message.includes('fake_table'),
      'Error message has table reference'
    );
  });
});
