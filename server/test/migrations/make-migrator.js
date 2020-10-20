const assert = require('assert');
const TestUtils = require('../utils');

describe('lib/make-migrator', function () {
  const utils = new TestUtils();

  before(async function () {
    await utils.initDbs();
  });

  it('Not up-to-date without running mirations', async function () {
    const upToDate = await utils.migrator.schemaUpToDate();
    assert(!upToDate);

    const majorVersion = await utils.migrator.getDbMajorVersion();
    assert.strictEqual(majorVersion, 0);
  });

  it('Up to date after running migrations', async function () {
    await utils.migrator.migrate();
    const upToDate = await utils.migrator.schemaUpToDate();
    assert(upToDate);

    const majorVersion = await utils.migrator.getDbMajorVersion();
    assert.strictEqual(majorVersion, 5);
  });
});
