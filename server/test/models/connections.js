const assert = require('assert');
const TestUtils = require('../utils');

describe('config.getConnections', function () {
  const utils = new TestUtils();

  before(function () {
    return utils.init(true);
  });

  it('handles empty object', function () {
    const cs = utils.config.getConnections({});
    assert(Array.isArray(cs));
  });

  it('skips partial connections', function () {
    const cs = utils.config.getConnections({
      SQLPAD_CONNECTIONS__abc__driver: 'postgres',
    });
    assert(Array.isArray(cs));
    assert.equal(cs.length, 0, 'c should be empty');
  });

  it('parses connection properly', function () {
    const cs = utils.config.getConnections({
      SQLPAD_CONNECTIONS__abc__driver: 'postgres',
      SQLPAD_CONNECTIONS__abc__name: 'env-postgres',
      SQLPAD_CONNECTIONS__abc__host: 'localhost',
      SQLPAD_CONNECTIONS__abc__port: '5432',
      SQLPAD_CONNECTIONS__abc__postgresSsl: 'true',
    });
    assert(Array.isArray(cs));
    assert.equal(cs.length, 1, 'cs should have 1');
    const connection = cs[0];
    assert.strictEqual(connection.editable, false, 'connection.editable');
    assert.strictEqual(connection.id, 'abc', 'connection.id');
    assert.strictEqual(connection.driver, 'postgres', 'connection.driver');
    assert.strictEqual(connection.name, 'env-postgres', 'connection.name');
    assert.strictEqual(
      connection.data.host,
      'localhost',
      'connection.data.host'
    );
    assert.strictEqual(connection.data.port, '5432', 'connection.data.port');
    assert.strictEqual(
      connection.data.postgresSsl,
      true,
      'connection.data.postgresSsl'
    );
  });

  it('includes env connection in all connections', async function () {
    process.env.SQLPAD_CONNECTIONS__abc__driver = 'postgres';
    process.env.SQLPAD_CONNECTIONS__abc__name = 'env-postgres';
    process.env.SQLPAD_CONNECTIONS__abc__host = 'localhost';
    process.env.SQLPAD_CONNECTIONS__abc__port = '5432';
    process.env.SQLPAD_CONNECTIONS__abc__postgresSsl = 'true';

    const allConnections = await utils.models.connections.findAll();
    const connection = allConnections.find((c) => c.id === 'abc');
    assert.strictEqual(connection.name, 'env-postgres', 'connection.name');
    assert.strictEqual(connection.editable, false, 'connection.editable');

    delete process.env.SQLPAD_CONNECTIONS__abc__driver;
    delete process.env.SQLPAD_CONNECTIONS__abc__name;
    delete process.env.SQLPAD_CONNECTIONS__abc__host;
    delete process.env.SQLPAD_CONNECTIONS__abc__port;
    delete process.env.SQLPAD_CONNECTIONS__abc__postgresSsl;
  });

  it('includes env connection by id', async function () {
    process.env.SQLPAD_CONNECTIONS__abc__driver = 'postgres';
    process.env.SQLPAD_CONNECTIONS__abc__name = 'env-postgres';
    process.env.SQLPAD_CONNECTIONS__abc__host = 'localhost';
    process.env.SQLPAD_CONNECTIONS__abc__port = '5432';
    process.env.SQLPAD_CONNECTIONS__abc__postgresSsl = 'true';

    const connection = await utils.models.connections.findOneById('abc');
    assert.strictEqual(connection.name, 'env-postgres', 'connection.name');
    assert.strictEqual(connection.editable, false, 'connection.editable');

    // driver-specific field like host should be on base and in data
    assert.strictEqual(connection.host, 'localhost');
    assert.strictEqual(connection.data.host, 'localhost');

    delete process.env.SQLPAD_CONNECTIONS__abc__driver;
    delete process.env.SQLPAD_CONNECTIONS__abc__name;
    delete process.env.SQLPAD_CONNECTIONS__abc__host;
    delete process.env.SQLPAD_CONNECTIONS__abc__port;
    delete process.env.SQLPAD_CONNECTIONS__abc__postgresSsl;
  });
});
