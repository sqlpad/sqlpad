const assert = require('assert');
const consts = require('../../lib/consts');
const TestUtils = require('../utils');

const createQueryBody = {
  name: 'test query',
  tags: ['one', 'two'],
  connectionId: 'someConnectionId',
  queryText: 'SELECT * FROM some_table',
  chartConfiguration: {
    chartType: 'line',
    fields: {
      x: 'field1',
      y: 'field2'
    }
  }
};

describe('api/queries', function() {
  const utils = new TestUtils();
  let query;

  before(function() {
    return utils.init(true);
  });

  it('Returns empty array', async function() {
    const body = await utils.get('editor', '/api/queries');
    assert(!body.error, 'Expect no error');
    assert(Array.isArray(body.queries), 'queries is an array');
    assert.equal(body.queries.length, 0, '0 length');
  });

  it('Creates query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    assert(!body.error, 'no error');
    assert(body.query._id, 'has _id');
    assert.equal(body.query.name, 'test query');
    query = body.query;
  });

  it('Gets array of 1', async function() {
    const body = await utils.get('editor', '/api/queries');
    assert.equal(body.queries.length, 1, '1 length');
  });

  it('Updates query', async function() {
    const body = await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      name: 'test query2'
    });

    assert(!body.error, 'no error');
    assert(body.query._id, 'has _id');
    assert.equal(body.query.name, 'test query2');
  });

  it('Owner can get own query', async function() {
    const body = await utils.get('editor', `/api/queries/${query._id}`);
    assert(!body.error, 'no error');
    assert.equal(body.query.name, 'test query2');
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body.query.canRead, true);
    assert.strictEqual(body.query.canWrite, true);
    assert.strictEqual(body.query.canDelete, true);
  });

  it('Editor2 cannot get query without permission', async function() {
    const body = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(body.error);
  });

  it('Editor2 can get query with specific userId permission', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [{ userId: utils.users.editor2._id, write: false }]
    });
    assert(!body1.error);

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(!body2.error);
  });

  it('Editor2 can only view without write permission', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ userId: utils.users.editor2._id, write: false }]
    });
    assert(!body1.error);

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(!body2.error);

    const body3 = await utils.put('editor2', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ userId: utils.users.editor2._id, write: false }]
    });
    assert(body3.error);
  });

  it('Editor2 can update with write permission', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ userId: utils.users.editor2._id, write: true }]
    });
    assert(!body1.error);

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(body2.query);

    const body3 = await utils.put('editor2', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ userId: utils.users.editor2._id, write: true }]
    });
    assert(!body3.error);
  });

  it('Admin is exempt from query ACL', async function() {
    const body1 = await utils.get('admin', `/api/queries/${query._id}`);
    assert(body1.query);
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body1.query.canRead, true);
    assert.strictEqual(body1.query.canWrite, true);
    assert.strictEqual(body1.query.canDelete, true);

    const body2 = await utils.get('admin', '/api/queries');
    assert.equal(body2.queries.length, 1);

    const body3 = await utils.put('admin', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ userId: utils.users.editor2._id, write: true }]
    });
    assert(!body3.error);
  });

  it('acl userEmail gives access like expected', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ userEmail: 'editor2@test.com', write: true }]
    });
    assert(!body1.error);
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body1.query.canRead, true);
    assert.strictEqual(body1.query.canWrite, true);
    assert.strictEqual(body1.query.canDelete, true);

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(body2.query);
    assert.strictEqual(body2.query.canRead, true);
    assert.strictEqual(body2.query.canWrite, true);
    assert.strictEqual(body2.query.canDelete, false);

    const body3 = await utils.put('editor2', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ userEmail: 'editor2@test.com', write: false }]
    });
    assert(!body3.error);
    assert.strictEqual(body3.query.canRead, true);
    assert.strictEqual(body3.query.canWrite, false);
    assert.strictEqual(body3.query.canDelete, false);
  });

  it('groupId __EVERYONE__ gives access like expected', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ groupId: consts.EVERYONE_ID, write: true }]
    });
    assert(!body1.error);

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(body2.query);
    assert.strictEqual(body2.query.canRead, true);
    assert.strictEqual(body2.query.canWrite, true);
    assert.strictEqual(body2.query.canDelete, false);

    const body3 = await utils.put('editor2', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ groupId: consts.EVERYONE_ID, write: false }]
    });
    assert(!body3.error);
    assert.strictEqual(body3.query.canRead, true);
    assert.strictEqual(body3.query.canWrite, false);
    assert.strictEqual(body3.query.canDelete, false);
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/queries/${query._id}`, 302);
  });

  it('Owner can delete query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    assert(!body.error, 'no error');
    const deleteResponse = await utils.del(
      'editor',
      `/api/queries/${body.query._id}`
    );
    assert(!deleteResponse.error);
  });

  it('Admin can delete query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    assert(!body.error, 'no error');
    const deleteResponse = await utils.del(
      'admin',
      `/api/queries/${body.query._id}`
    );
    assert(!deleteResponse.error);
  });

  it('Non-owner cannot delete query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    assert(!body.error, 'no error');
    const deleteResponse = await utils.del(
      'editor2',
      `/api/queries/${body.query._id}`
    );
    assert(deleteResponse.error);
  });

  it('ACL does not permit query deletion', async function() {
    const body = await utils.post('editor', '/api/queries', {
      ...createQueryBody,
      acl: [{ userId: consts.EVERYONE_ID, write: true }]
    });
    assert(!body.error, 'no error');
    const deleteResponse = await utils.del(
      'editor2',
      `/api/queries/${body.query._id}`
    );
    assert(deleteResponse.error);
  });
});
