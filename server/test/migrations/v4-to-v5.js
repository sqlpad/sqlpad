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
      dbInMemory: false,
      appLogLevel: 'debug'
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

  it.skip('After migration - has queries', async function() {
    // TODO once migrations are written
  });
});
