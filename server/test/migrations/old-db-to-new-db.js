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

// This test scaffold is left as a shell in case future DB migrations need to be tested in similar manner
describe.skip('old-db-to-new-db', function () {
  /**
   * @type {TestUtils}
   */
  let utils;

  before('preps the env', async function () {
    utils = new TestUtils({
      dbPath: path.join(__dirname, '../artifacts/v4-to-v5'),
      dbInMemory: false,
    });

    const destination = utils.config.get('dbPath');

    await utils.prepDbDir();
    await copyDbFiles(sourceDir, destination);

    await utils.initDbs();
  });

  after(function () {
    return utils.sequelizeDb.sequelize.close();
  });

  it('Before migration', async function () {
    // Assert the data loaded is what is expected
    // NOTE - using the sequelize model here may cause problems in future migrations
  });

  it('Migrates', async function () {
    await utils.migrate();
  });

  it('After migration is as expected', async function () {
    // Assert the data migrated as expected
    // NOTE - using the sequelize model here may cause problems in future migrations
  });
});
