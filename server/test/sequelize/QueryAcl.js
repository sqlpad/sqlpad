const assert = require('assert');
const sequelizeDb = require('../../sequelize');

describe('QueryAcl', function() {
  it('write defaults to false', async function() {
    const sdb = sequelizeDb.getDb();
    const queryAcl = await sdb.QueryAcl.create({
      queryId: 'foo',
      userId: 'bar'
    });
    assert(queryAcl.id);
    assert.strictEqual(queryAcl.queryId, 'foo');
    assert.strictEqual(queryAcl.userId, 'bar');
    assert.strictEqual(queryAcl.write, false);
  });
});
