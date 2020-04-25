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
    TestUtils.validateListSuccessBody(body);
    assert.equal(body.length, 0, '0 length');
  });

  it('Creates query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    assert(body.id, 'has id');
    assert.equal(body.name, 'test query');
    query = body;
  });

  it('Gets array of 1', async function() {
    const body = await utils.get('editor', '/api/queries');
    assert.equal(body.length, 1, '1 length');
  });

  it('Updates query', async function() {
    const body = await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2'
    });
    assert(body.id, 'has id');
    assert.equal(body.name, 'test query2');
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/queries/${query.id}`, 401);
  });

  it('Owner can get own query', async function() {
    const body = await utils.get('editor', `/api/queries/${query.id}`);
    assert.equal(body.name, 'test query2');
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body.canRead, true);
    assert.strictEqual(body.canWrite, true);
    assert.strictEqual(body.canDelete, true);
  });

  it('Editor2 cannot get query without permission', async function() {
    await utils.get('editor2', `/api/queries/${query.id}`, 403);
  });

  it('Permissions for other users are not used', async function() {
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true }
      ]
    });

    // editor2 cannot read based on the above acl
    await utils.get('editor2', `/api/queries/${query.id}`, 403);

    // Add read access for editor 2
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { userId: utils.users.editor2.id, write: false }
      ]
    });

    // Editor 2 can read at this point
    await utils.get('editor2', `/api/queries/${query.id}`);

    // But not write
    await utils.put(
      'editor2',
      `/api/queries/${query.id}`,
      {
        ...createQueryBody,
        acl: [
          { userId: 'fakeUser', write: true },
          { userEmail: 'fakeEmail', write: true },
          { groupId: 'fakeGroup', write: true },
          { groupId: '__EVERYONE__', write: false },
          { userId: utils.users.editor2.id, write: false }
        ]
      },
      403
    );

    // Add write access for editor 2
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { groupId: '__EVERYONE__', write: false },
        { userId: utils.users.editor2.id, write: true }
      ]
    });
  });

  it('honors max matching permission only', async function() {
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { groupId: '__EVERYONE__', write: false },
        { userId: utils.users.editor2.id, write: false }
      ]
    });

    await utils.put(
      'editor2',
      `/api/queries/${query.id}`,
      createQueryBody,
      403
    );

    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { groupId: '__EVERYONE__', write: true },
        { userId: utils.users.editor2.id, write: false }
      ]
    });

    await utils.put('editor2', `/api/queries/${query.id}`, createQueryBody);
  });

  it('ACL userId permissions work as expected', async function() {
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { userId: utils.users.editor2.id, write: false }
      ]
    });

    await utils.get('editor2', `/api/queries/${query.id}`);

    await utils.put(
      'editor2',
      `/api/queries/${query.id}`,
      {
        ...createQueryBody,
        acl: [
          { userId: 'fakeUser', write: true },
          { userEmail: 'fakeEmail', write: true },
          { groupId: 'fakeGroup', write: true },
          { groupId: '__EVERYONE__', write: false },
          { userId: utils.users.editor2.id, write: false }
        ]
      },
      403
    );

    // Now use editor to give access, editor 2 should be able to update
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { userId: utils.users.editor2.id, write: true }
      ]
    });

    // editor2 can update
    await utils.put('editor2', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { userId: utils.users.editor2.id, write: false }
      ]
    });

    // editor2 should not be able to delete
    await utils.del('editor2', `/api/queries/${query.id}`, 403);
  });

  it('Admin is exempt from query ACL', async function() {
    const body1 = await utils.get('admin', `/api/queries/${query.id}`);
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body1.canRead, true);
    assert.strictEqual(body1.canWrite, true);
    assert.strictEqual(body1.canDelete, true);

    const body2 = await utils.get('admin', '/api/queries');
    assert.equal(body2.length, 1);

    await utils.put('admin', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [{ userId: utils.users.editor2.id, write: true }]
    });
  });

  it('ACL userEmail gives access like expected', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [{ userEmail: 'editor2@test.com', write: true }]
    });
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body1.canRead, true);
    assert.strictEqual(body1.canWrite, true);
    assert.strictEqual(body1.canDelete, true);

    const body2 = await utils.get('editor2', `/api/queries/${query.id}`);
    assert(body2);
    assert.strictEqual(body2.canRead, true);
    assert.strictEqual(body2.canWrite, true);
    assert.strictEqual(body2.canDelete, false);

    const body3 = await utils.put('editor2', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [{ userEmail: 'editor2@test.com', write: false }]
    });
    assert.strictEqual(body3.canRead, true);
    assert.strictEqual(body3.canWrite, false);
    assert.strictEqual(body3.canDelete, false);
  });

  it('ACL groupId __EVERYONE__ gives access like expected', async function() {
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [{ groupId: consts.EVERYONE_ID, write: true }]
    });

    const body2 = await utils.get('editor2', `/api/queries/${query.id}`);
    assert(body2);
    assert.strictEqual(body2.canRead, true);
    assert.strictEqual(body2.canWrite, true);
    assert.strictEqual(body2.canDelete, false);

    const body3 = await utils.put('editor2', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [{ groupId: consts.EVERYONE_ID, write: false }]
    });
    assert.strictEqual(body3.canRead, true);
    assert.strictEqual(body3.canWrite, false);
    assert.strictEqual(body3.canDelete, false);
  });

  it('Owner can delete query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    await utils.del('editor', `/api/queries/${body.id}`);
  });

  it('Admin can delete query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    await utils.del('admin', `/api/queries/${body.id}`);
  });

  it('Non-owner cannot delete query', async function() {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    await utils.del('editor2', `/api/queries/${body.id}`, 403);
  });

  it('ACL does not permit query deletion', async function() {
    const body = await utils.post('editor', '/api/queries', {
      ...createQueryBody,
      acl: [{ userId: consts.EVERYONE_ID, write: true }]
    });
    await utils.del('editor2', `/api/queries/${body.id}`, 403);
  });
});
