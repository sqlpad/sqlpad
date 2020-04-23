const assert = require('assert');
const path = require('path');
// const fs = require('fs');
const ncp = require('ncp').ncp;
const TestUtils = require('../utils');

ncp.limit = 16;

const sourceDir = path.join(__dirname, '../fixtures/v4.2.0-test-db/testdb');

let originalQueries;
let originalConnections;
let originalConnectionAccesses;
let originalQueryHistory;
let originalUsers;

function copyDbFiles(source, destination) {
  return new Promise((resolve, reject) => {
    ncp(source, destination, function(err) {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

describe('v4-to-v5', function() {
  /**
   * @type {TestUtils}
   */
  let utils;

  before('preps the env', async function() {
    utils = new TestUtils({
      dbPath: path.join(__dirname, '../artifacts/v4-to-v5'),
      dbInMemory: false
      // appLogLevel: 'debug'
    });

    const destination = utils.config.get('dbPath');

    await utils.prepDbDir();
    await copyDbFiles(sourceDir, destination);

    await utils.initDbs();
  });

  after(function() {
    return utils.sequelizeDb.sequelize.close();
  });

  it('Before migration - has queries', async function() {
    originalQueries = await utils.nedb.queries.find({});
    originalConnectionAccesses = await utils.nedb.connectionAccesses.find({});
    originalConnections = await utils.nedb.connections.find({});
    originalQueryHistory = await utils.nedb.queryHistory.find({});
    originalUsers = await utils.nedb.users.find({});

    assert(originalQueries);
    assert(originalConnectionAccesses);
    assert(originalConnections);
    assert(originalQueryHistory);
    assert(originalUsers);

    // write source files for reference
    // fs.writeFileSync(
    //   path.join(sourceDir, 'originalQueries.json'),
    //   JSON.stringify(originalQueries, null, 2)
    // );
    // fs.writeFileSync(
    //   path.join(sourceDir, 'originalConnectionAccesses.json'),
    //   JSON.stringify(originalConnectionAccesses, null, 2)
    // );
    // fs.writeFileSync(
    //   path.join(sourceDir, 'originalConnections.json'),
    //   JSON.stringify(originalConnections, null, 2)
    // );
    // fs.writeFileSync(
    //   path.join(sourceDir, 'originalQueryHistory.json'),
    //   JSON.stringify(originalQueryHistory, null, 2)
    // );
    // fs.writeFileSync(
    //   path.join(sourceDir, 'originalUsers.json'),
    //   JSON.stringify(originalUsers, null, 2)
    // );
  });

  it('Migrates', async function() {
    await utils.migrate();
  });

  it('Queries & tags migrated as expected', async function() {
    const queries = await utils.sequelizeDb.Queries.findAll({});
    const queryTags = await utils.sequelizeDb.QueryTags.findAll({});

    assert.equal(queries.length, originalQueries.length);

    for (const original of originalQueries) {
      const query = queries.find(item => item.id === original._id);

      assert.equal(query.id, original._id);
      assert.equal(query.name, original.name);
      assert.equal(query.connectionId, original.connectionId, 'connectionId');
      assert.equal(query.queryText, original.queryText);
      if (original.chartConfiguration) {
        assert.deepEqual(query.chart, original.chartConfiguration);
      }
      assert.equal(query.createdBy, original.createdBy, 'createdBy');
      assert.equal(query.updatedBy, original.modifiedBy, 'updatedBy');
      assert.equal(
        new Date(query.updatedAt).toISOString(),
        new Date(original.modifiedDate).toISOString(),
        'updatedAt'
      );
      assert.equal(
        new Date(query.createdAt).toISOString(),
        new Date(original.createdDate).toISOString(),
        'createdAt'
      );
      assert.equal(
        new Date(query.lastAccessedAt).toISOString(),
        new Date(original.lastAccessDate).toISOString(),
        'lastAccessedAt'
      );

      if (original.tags) {
        const foundTags = queryTags
          .filter(qt => qt.queryId === query.id)
          .map(qt => qt.tag);

        assert.equal(foundTags.length, original.tags.length);
        original.tags.forEach(tag => {
          assert(foundTags.includes(tag));
        });
      }
    }
  });

  it('Connections migrated as expected', async function() {
    const connections = await utils.sequelizeDb.Connections.findAll({});

    assert.equal(connections.length, originalConnections.length);

    for (const original of originalConnections) {
      const connection = connections.find(item => item.id === original._id);

      assert.equal(connection.id, original._id);
      assert.equal(connection.name, original.name);
      assert.equal(connection.driver, original.driver, 'driver');
      assert.equal(
        connection.multiStatementTransactionEnabled,
        original.multiStatementTransactionEnabled,
        'mst enabled'
      );
      assert.equal(
        connection.idleTimeoutSeconds,
        original.idleTimeoutSeconds,
        'idle timeout seconds'
      );

      // for every data field in new connection, confirm it was on base object of original
      if (connection.data) {
        // You have to parse JSON fields in Sequelize!?
        const data = JSON.parse(connection.data);
        Object.keys(data).forEach(key => {
          const value = data[key];
          assert.equal(value, original[key], `matches ${key}:${value}`);
        });
      }

      assert.equal(
        new Date(connection.updatedAt).toISOString(),
        new Date(original.modifiedDate).toISOString(),
        'updatedAt'
      );
      assert.equal(
        new Date(connection.createdAt).toISOString(),
        new Date(original.createdDate).toISOString(),
        'createdAt'
      );
    }
  });

  it('Connection Accesses migrated as expected', async function() {
    const connectionAccesses = await utils.sequelizeDb.ConnectionAccesses.findAll(
      {}
    );

    assert.equal(connectionAccesses.length, originalConnectionAccesses.length);

    for (const original of originalConnectionAccesses) {
      // id is not kept for connection accesses,
      // so we need to find it by other means
      const connectionAccess = connectionAccesses.find(
        item =>
          item.connectionId === original.connectionId &&
          item.userId === original.userId
      );

      assert.equal(typeof connectionAccess.id, 'number');
      assert.equal(connectionAccess.userEmail, original.userEmail);
      assert.equal(connectionAccess.connectionName, original.connectionName);
      assert.equal(connectionAccess.duration, original.duration);

      assert.equal(
        new Date(connectionAccess.expiryDate).toISOString(),
        new Date(original.expiryDate).toISOString(),
        'expiryDate'
      );
      assert(connectionAccess.createdAt);
    }
  });

  it('Query history migrated as expected', async function() {
    const queryHistory = await utils.sequelizeDb.QueryHistory.findAll({});

    assert.equal(queryHistory.length, originalQueryHistory.length);

    for (const original of originalQueryHistory) {
      // id is not kept for query history so we'll just see if we can find a match
      const found = queryHistory.find(
        item =>
          item.connectionId === original.connectionId &&
          item.userId === original.userId &&
          item.userEmail === original.userEmail &&
          item.connectionName === original.connectionName &&
          new Date(item.startTime).toISOString() ===
            new Date(original.startTime).toISOString() &&
          item.queryRunTime === original.queryRunTime &&
          item.queryName === original.queryName &&
          item.queryText === original.queryText &&
          item.incomplete === original.incomplete &&
          item.rowCount === original.rowCount
      );

      // query id could be string or null and null !== null
      assert.equal(found.queryId || '', original.queryId || '');

      assert(found);
    }
  });

  it('Users migrated as expected', async function() {
    const users = await utils.sequelizeDb.Users.findAll({});

    assert.equal(users.length, originalUsers.length);

    for (const original of originalUsers) {
      let user = users.find(item => item.id === original._id);
      user = user.toJSON();
      assert.equal(user.email, original.email);
      assert.equal(user.role, original.role);
      assert.equal(user.name, original.name);
      assert.equal(user.passhash, original.passhash);
      assert.equal(user.passwordResetId, original.passwordResetId);
      assert.equal(user.data, JSON.stringify(original.data));

      if (original.signupDate) {
        assert.equal(
          new Date(user.signupAt).toISOString(),
          new Date(original.signupDate).toISOString(),
          'signupAt'
        );
      }

      assert.equal(
        new Date(user.createdAt).toISOString(),
        new Date(original.createdDate).toISOString(),
        'createdAt'
      );
    }
  });
});
