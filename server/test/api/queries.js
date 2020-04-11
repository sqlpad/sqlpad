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
    assert(Array.isArray(body.data), 'data is an array');
    assert.equal(body.data.length, 0, '0 length');
  });

  it('Creates query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    assert(body.data._id, 'has _id');
    assert.equal(body.data.name, 'test query');
    query = body.data;
  });

  it('Gets array of 1', async function() {
    const body = await utils.get('editor', '/api/queries');
    assert.equal(body.data.length, 1, '1 length');
  });

  it('Updates query', async function() {
    const body = await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      name: 'test query2'
    });
    assert(body.data._id, 'has _id');
    assert.equal(body.data.name, 'test query2');
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/queries/${query._id}`, 401);
  });

  it('Owner can get own query', async function() {
    const body = await utils.get('editor', `/api/queries/${query._id}`);
    assert.equal(body.data.name, 'test query2');
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body.data.canRead, true);
    assert.strictEqual(body.data.canWrite, true);
    assert.strictEqual(body.data.canDelete, true);
  });

  it('Editor2 cannot get query without permission', async function() {
    await utils.get('editor2', `/api/queries/${query._id}`, 403);
  });

  it('Permissions for other users are not used', async function() {
    await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true }
      ]
    });

    // editor2 cannot read based on the above acl
    await utils.get('editor2', `/api/queries/${query._id}`, 403);

    // Add read access for editor 2
    await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { userId: utils.users.editor2._id, write: false }
      ]
    });

    // Editor 2 can read at this point
    await utils.get('editor2', `/api/queries/${query._id}`);

    // But not write
    await utils.put(
      'editor2',
      `/api/queries/${query._id}`,
      {
        ...createQueryBody,
        acl: [
          { userId: 'fakeUser', write: true },
          { userEmail: 'fakeEmail', write: true },
          { groupId: 'fakeGroup', write: true },
          { groupId: '__EVERYONE__', write: false },
          { userId: utils.users.editor2._id, write: false }
        ]
      },
      403
    );

    // Add write access for editor 2
    await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { groupId: '__EVERYONE__', write: false },
        { userId: utils.users.editor2._id, write: true }
      ]
    });
  });

  it('honors max matching permission only', async function() {
    await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { groupId: '__EVERYONE__', write: false },
        { userId: utils.users.editor2._id, write: false }
      ]
    });

    await utils.put(
      'editor2',
      `/api/queries/${query._id}`,
      createQueryBody,
      403
    );

    await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { groupId: '__EVERYONE__', write: true },
        { userId: utils.users.editor2._id, write: false }
      ]
    });

    await utils.put('editor2', `/api/queries/${query._id}`, createQueryBody);
  });

  it('ACL userId permissions work as expected', async function() {
    await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { userId: utils.users.editor2._id, write: false }
      ]
    });

    await utils.get('editor2', `/api/queries/${query._id}`);

    await utils.put(
      'editor2',
      `/api/queries/${query._id}`,
      {
        ...createQueryBody,
        acl: [
          { userId: 'fakeUser', write: true },
          { userEmail: 'fakeEmail', write: true },
          { groupId: 'fakeGroup', write: true },
          { groupId: '__EVERYONE__', write: false },
          { userId: utils.users.editor2._id, write: false }
        ]
      },
      403
    );

    // Now use editor to give access, editor 2 should be able to update
    await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { userId: utils.users.editor2._id, write: true }
      ]
    });

    // editor2 can update
    await utils.put('editor2', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { userId: utils.users.editor2._id, write: false }
      ]
    });

    // editor2 should not be able to delete
    await utils.del('editor2', `/api/queries/${query._id}`, 403);
  });

  it('Admin is exempt from query ACL', async function() {
    const body1 = await utils.get('admin', `/api/queries/${query._id}`);
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body1.data.canRead, true);
    assert.strictEqual(body1.data.canWrite, true);
    assert.strictEqual(body1.data.canDelete, true);

    const body2 = await utils.get('admin', '/api/queries');
    assert.equal(body2.data.length, 1);

    await utils.put('admin', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ userId: utils.users.editor2._id, write: true }]
    });
  });

  it('ACL userEmail gives access like expected', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ userEmail: 'editor2@test.com', write: true }]
    });
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body1.data.canRead, true);
    assert.strictEqual(body1.data.canWrite, true);
    assert.strictEqual(body1.data.canDelete, true);

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(body2.data);
    assert.strictEqual(body2.data.canRead, true);
    assert.strictEqual(body2.data.canWrite, true);
    assert.strictEqual(body2.data.canDelete, false);

    const body3 = await utils.put('editor2', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ userEmail: 'editor2@test.com', write: false }]
    });
    assert.strictEqual(body3.data.canRead, true);
    assert.strictEqual(body3.data.canWrite, false);
    assert.strictEqual(body3.data.canDelete, false);
  });

  it('ACL groupId __EVERYONE__ gives access like expected', async function() {
    await utils.put('editor', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ groupId: consts.EVERYONE_ID, write: true }]
    });

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(body2.data);
    assert.strictEqual(body2.data.canRead, true);
    assert.strictEqual(body2.data.canWrite, true);
    assert.strictEqual(body2.data.canDelete, false);

    const body3 = await utils.put('editor2', `/api/queries/${query._id}`, {
      ...createQueryBody,
      acl: [{ groupId: consts.EVERYONE_ID, write: false }]
    });
    assert.strictEqual(body3.data.canRead, true);
    assert.strictEqual(body3.data.canWrite, false);
    assert.strictEqual(body3.data.canDelete, false);
  });

  it('Owner can delete query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    await utils.del('editor', `/api/queries/${body.data._id}`);
  });

  it('Admin can delete query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    await utils.del('admin', `/api/queries/${body.data._id}`);
  });

  it('Non-owner cannot delete query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    await utils.del('editor2', `/api/queries/${body.data._id}`, 403);
  });

  it('ACL does not permit query deletion', async function() {
    const body = await utils.post('editor', '/api/queries', {
      ...createQueryBody,
      acl: [{ userId: consts.EVERYONE_ID, write: true }]
    });
    await utils.del('editor2', `/api/queries/${body.data._id}`, 403);
  });
});
