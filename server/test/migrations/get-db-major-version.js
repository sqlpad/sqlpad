/* eslint-disable no-await-in-loop */
const assert = require('assert');
const path = require('path');
const ncp = require('ncp').ncp;
const TestUtils = require('../utils');

ncp.limit = 16;

const sourceDir = path.join(__dirname, '../fixtures/v4.2.0-test-db/testdb');

function copyDbFiles(source, destination) {
  return new Promise((resolve, reject) => {
    ncp(source, destination, function (err) {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

describe('migrations/get-db-major-version', function () {
  /**
   * @type {TestUtils}
   */
  let utils;

  before('preps the env', async function () {
    utils = new TestUtils({
      dbPath: path.join(__dirname, '../artifacts/v4-to-v5'),
      dbInMemory: false,
      // Force this test to only run with SQLite
      backendDatabaseUri: '',
    });

    const destination = utils.config.get('dbPath');

    await utils.prepDbDir();
    await copyDbFiles(sourceDir, destination);

    await utils.initDbs();
  });

  after(function () {
    return utils.sequelizeDb.sequelize.close();
  });

  it('Before migration - major version is 4', async function () {
    const major = await utils.migrator.getDbMajorVersion();
    assert.strictEqual(major, 4);
  });

  it('Migrates', async function () {
    await utils.migrate();
  });

  it('After migration - major is 5', async function () {
    const major = await utils.migrator.getDbMajorVersion();
    assert.strictEqual(major, 5);
  });
});
