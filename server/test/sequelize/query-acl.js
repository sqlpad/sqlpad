const assert = require('assert');
const TestUtils = require('../utils');

describe('QueryAcl', function () {
  it('write expected results', async function () {
    const utils = new TestUtils();
    await utils.init();

    const sdb = utils.sequelizeDb;
    const queryId = 'query1';
    const qa1 = await sdb.QueryAcl.create({
      queryId,
      userId: 'test',
    });
    assert(qa1.id);
    assert.strictEqual(qa1.queryId, queryId);
    assert.strictEqual(qa1.userId, 'test');
    assert.strictEqual(qa1.write, false);

    const qa3 = await sdb.QueryAcl.create({
      queryId,
      groupId: 'group',
      write: true,
    });
    assert.strictEqual(qa3.queryId, queryId);
    assert(!qa3.userId);
    assert(!qa3.userEmail);
    assert.strictEqual(qa3.groupId, 'group');
    assert.strictEqual(qa3.write, true);
  });

  it('honors unique constraints', async function () {
    const utils = new TestUtils();
    await utils.init();

    await assert.rejects(async () => {
      await utils.models.sequelizeDb.QueryAcl.create({
        queryId: 'q1',
        userId: 'u1',
      });
      await utils.models.sequelizeDb.QueryAcl.create({
        queryId: 'q1',
        userId: 'u1',
      });
    });

    await assert.rejects(async () => {
      await utils.models.sequelizeDb.QueryAcl.create({
        queryId: 'q1',
        groupId: 'group1',
      });
      await utils.models.sequelizeDb.QueryAcl.create({
        queryId: 'q1',
        groupId: 'group1',
      });
    });
  });
});
