const assert = require('assert');
const TestUtils = require('../utils');

describe('QueryAcl', function () {
  const utils = new TestUtils();

  before(async function () {
    await utils.initDbs();

    await utils.nedb.queries.insert({
      name: 'query 1',
      tags: ['test-tag'],
      connectionId: 'test',
      queryText: 'SELECT 1 AS val FROM table',
      createdDate: new Date(),
      updatedDate: new Date(),
      createdBy: 'testuser',
      lastAccessDate: new Date(),
    });

    await utils.nedb.queries.insert({
      name: 'query 2',
      tags: ['test-tag'],
      connectionId: 'test',
      queryText: 'SELECT 2 AS val FROM table',
      createdDate: new Date(),
      updatedDate: new Date(),
      createdBy: 'testuser',
      lastAccessDate: new Date(),
    });

    await utils.migrate();
  });

  it('created QueryAcl records', async function () {
    const sdb = utils.sequelizeDb;
    const queryAcls = await sdb.QueryAcl.findAll();
    assert(queryAcls);
  });
});
