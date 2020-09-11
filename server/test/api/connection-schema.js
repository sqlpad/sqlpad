const assert = require('assert');
const TestUtils = require('../utils');
const ConnectionClient = require('../../lib/connection-client');

describe('api/connections/<id>/schema', function () {
  this.timeout(10000);
  const utils = new TestUtils();
  let connection;
  let user1;
  let user2;

  before(async function () {
    await utils.init(true);

    // Create some users to use to ensure dynamic connection is cached properly
    user1 = await utils.addUserApiHelper('user1', {
      email: 'user1@sqlpad.com',
      password: 'user1',
      role: 'admin',
      name: 'user1',
      data: {
        dbfilename: 'connection-schema.user1.sqlite',
      },
    });

    user2 = await utils.addUserApiHelper('user2', {
      email: 'user2@sqlpad.com',
      password: 'user2',
      role: 'admin',
      name: 'user2',
      data: {
        dbfilename: 'connection-schema.user2.sqlite',
      },
    });

    // Create a connection that looks to user data for db connection info
    // While this is the same connection, the underlying database is different
    const body = await utils.post('admin', '/api/connections', {
      driver: 'sqlite',
      name: 'sqlite-test',
      data: {
        filename: './test/artifacts/{{user.data.dbfilename}}',
      },
    });
    connection = body;

    // With user 1 create a table
    // Then with user 2 create a different table
    // Later ensure each user sees the correct schema
    const user1CC = new ConnectionClient(connection, user1);
    await user1CC.runQuery(`CREATE TABLE user1 (id INT, name TEXT)`);

    const user2CC = new ConnectionClient(connection, user2);
    await user2CC.runQuery(`CREATE TABLE user2 (id INT, name TEXT)`);
  });

  it('Gets schema-info honoring connection templates', async function () {
    const body1 = await utils.get(
      'user1',
      `/api/connections/${connection.id}/schema`
    );
    assert(body1, 'body');

    // Ensure format is as expected
    assert.strictEqual(body1.schemas[0].name, 'main');
    const table = body1.schemas[0].tables.find((t) => t.name === 'user1');
    assert.strictEqual(table.columns[0].name, 'id');
    assert.strictEqual(table.columns[0].dataType, 'INT');
    assert.strictEqual(table.columns[1].name, 'name');
    assert.strictEqual(table.columns[1].dataType, 'TEXT');

    // Ensure proper access for user1
    assert(
      body1.schemas[0].tables.find((t) => t.name === 'user1'),
      'user1 table exists'
    );
    assert(
      !body1.schemas[0].tables.find((t) => t.name === 'user2'),
      'user2 table does not exist'
    );

    // Ensure proper access for user2
    const body2 = await utils.get(
      'user2',
      `/api/connections/${connection.id}/schema`
    );
    assert(
      !body2.schemas[0].tables.find((t) => t.name === 'user1'),
      'user1 table does not exist'
    );
    assert(
      body2.schemas[0].tables.find((t) => t.name === 'user2'),
      'user2 table exists'
    );
  });

  it('Read from cache is successful', async function () {
    const body1 = await utils.get(
      'user1',
      `/api/connections/${connection.id}/schema`
    );
    assert(body1, 'body');
    assert(
      body1.schemas[0].tables.find((t) => t.name === 'user1'),
      'user1 table exists'
    );
  });
});
