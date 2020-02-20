const assert = require('assert');
const { getDb } = require('../../lib/db');
const { getConnectionsFromConfig } = require('../../lib/connectionsFromConfig');

describe('getConnectionsFromConfig', function() {
  let models;

  before(async function() {
    const db = await getDb();
    models = db.models;
  });

  it('handles empty object', function() {
    const cs = getConnectionsFromConfig({});
    assert(Array.isArray(cs));
  });

  it('skips partial connections', function() {
    const cs = getConnectionsFromConfig({
      SQLPAD_CONNECTIONS__abc__driver: 'postgres'
    });
    assert(Array.isArray(cs));
    assert.equal(cs.length, 0, 'c should be empty');
  });

  it('parses connection properly', function() {
    const cs = getConnectionsFromConfig({
      SQLPAD_CONNECTIONS__abc__driver: 'postgres',
      SQLPAD_CONNECTIONS__abc__name: 'env-postgres',
      SQLPAD_CONNECTIONS__abc__host: 'localhost',
      SQLPAD_CONNECTIONS__abc__port: '5432',
      SQLPAD_CONNECTIONS__abc__postgresSsl: 'true'
    });
    assert(Array.isArray(cs));
    assert.equal(cs.length, 1, 'cs should have 1');
    const connection = cs[0];
    assert.strictEqual(connection.editable, false, 'connection.editable');
    assert.strictEqual(connection._id, 'abc', 'connection._id');
    assert.strictEqual(connection.driver, 'postgres', 'connection.driver');
    assert.strictEqual(connection.name, 'env-postgres', 'connection.name');
    assert.strictEqual(connection.host, 'localhost', 'connection.host');
    assert.strictEqual(connection.port, '5432', 'connection.port');
    assert.strictEqual(connection.postgresSsl, true, 'connection.postgresSsl');
  });

  it('includes env connection in all connections', async function() {
    process.env.SQLPAD_CONNECTIONS__abc__driver = 'postgres';
    process.env.SQLPAD_CONNECTIONS__abc__name = 'env-postgres';
    process.env.SQLPAD_CONNECTIONS__abc__host = 'localhost';
    process.env.SQLPAD_CONNECTIONS__abc__port = '5432';
    process.env.SQLPAD_CONNECTIONS__abc__postgresSsl = 'true';

    const allConnections = await models.connections.findAll();
    const connection = allConnections.find(c => c._id === 'abc');
    assert.strictEqual(connection.name, 'env-postgres', 'connection.name');
    assert.strictEqual(connection.editable, false, 'connection.editable');

    delete process.env.SQLPAD_CONNECTIONS__abc__driver;
    delete process.env.SQLPAD_CONNECTIONS__abc__name;
    delete process.env.SQLPAD_CONNECTIONS__abc__host;
    delete process.env.SQLPAD_CONNECTIONS__abc__port;
    delete process.env.SQLPAD_CONNECTIONS__abc__postgresSsl;
  });

  it('includes env connection by id', async function() {
    process.env.SQLPAD_CONNECTIONS__abc__driver = 'postgres';
    process.env.SQLPAD_CONNECTIONS__abc__name = 'env-postgres';
    process.env.SQLPAD_CONNECTIONS__abc__host = 'localhost';
    process.env.SQLPAD_CONNECTIONS__abc__port = '5432';
    process.env.SQLPAD_CONNECTIONS__abc__postgresSsl = 'true';

    const connection = await models.connections.findOneById('abc');
    assert.strictEqual(connection.name, 'env-postgres', 'connection.name');
    assert.strictEqual(connection.editable, false, 'connection.editable');

    delete process.env.SQLPAD_CONNECTIONS__abc__driver;
    delete process.env.SQLPAD_CONNECTIONS__abc__name;
    delete process.env.SQLPAD_CONNECTIONS__abc__host;
    delete process.env.SQLPAD_CONNECTIONS__abc__port;
    delete process.env.SQLPAD_CONNECTIONS__abc__postgresSsl;
  });
});
