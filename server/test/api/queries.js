const assert = require('assert');
const consts = require('../../lib/consts');
const TestUtils = require('../utils');
const queryString = require('query-string');
const parseLinkHeader = require('parse-link-header');

const createQueryBody = {
  name: 'test query',
  tags: ['one', 'two'],
  connectionId: 'someConnectionId',
  queryText: 'SELECT * FROM some_table',
  chart: {
    chartType: 'line',
    fields: {
      x: 'field1',
      y: 'field2',
    },
  },
};

describe('api/queries', function () {
  let utils = new TestUtils();
  let query;

  before(function () {
    return utils.init(true);
  });

  it('Returns empty array', async function () {
    const body = await utils.get('editor', '/api/queries');
    TestUtils.validateListSuccessBody(body);
    assert.equal(body.length, 0, '0 length');
  });

  it('Creates query', async function () {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    assert(body.id, 'has id');
    assert.equal(body.name, 'test query');
    query = body;
  });

  it('Gets array of 1', async function () {
    const body = await utils.get('editor', '/api/queries');
    const query = body[0];
    assert(query.connection.id);
    assert.equal(query.tags[0], 'one');
    assert(query.canRead);
    assert(query.canWrite);
    assert(query.canDelete);

    assert.equal(body.length, 1, '1 length');
  });

  it('Updates query', async function () {
    const body = await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
    });
    assert(body.id, 'has id');
    assert.equal(body.name, 'test query2');
  });

  it('Requires authentication', function () {
    return utils.get(null, `/api/queries/${query.id}`, 401);
  });

  it('Owner can get own query', async function () {
    const body = await utils.get('editor', `/api/queries/${query.id}`);
    assert.equal(body.name, 'test query2');
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body.canRead, true);
    assert.strictEqual(body.canWrite, true);
    assert.strictEqual(body.canDelete, true);
  });

  it('Editor2 cannot get query without permission', async function () {
    await utils.get('editor2', `/api/queries/${query.id}`, 403);
  });

  it('Permissions for other users are not used', async function () {
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
      ],
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
        { userId: utils.users.editor2.id, write: false },
      ],
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
          { userId: utils.users.editor2.id, write: false },
        ],
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
        { userId: utils.users.editor2.id, write: true },
      ],
    });
  });

  it('honors max matching permission only', async function () {
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { groupId: '__EVERYONE__', write: false },
        { userId: utils.users.editor2.id, write: false },
      ],
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
        { userId: utils.users.editor2.id, write: false },
      ],
    });

    await utils.put('editor2', `/api/queries/${query.id}`, createQueryBody);
  });

  it('ACL userId permissions work as expected', async function () {
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      name: 'test query2',
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { userId: utils.users.editor2.id, write: false },
      ],
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
          { userId: utils.users.editor2.id, write: false },
        ],
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
        { userId: utils.users.editor2.id, write: true },
      ],
    });

    // editor2 can update
    await utils.put('editor2', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [
        { userId: 'fakeUser', write: true },
        { userEmail: 'fakeEmail', write: true },
        { groupId: 'fakeGroup', write: true },
        { userId: utils.users.editor2.id, write: false },
      ],
    });

    // editor2 should not be able to delete
    await utils.del('editor2', `/api/queries/${query.id}`, 403);
  });

  it('Admin is exempt from query ACL', async function () {
    const body1 = await utils.get('admin', `/api/queries/${query.id}`);
    // can<Action> represents what user that made API call can do
    assert.strictEqual(body1.canRead, true);
    assert.strictEqual(body1.canWrite, true);
    assert.strictEqual(body1.canDelete, true);

    const body2 = await utils.get('admin', '/api/queries');
    assert.equal(body2.length, 1);

    await utils.put('admin', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [{ userId: utils.users.editor2.id, write: true }],
    });
  });

  it('ACL userEmail gives access like expected', async function () {
    const body1 = await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [{ userEmail: 'editor2@test.com', write: true }],
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
      acl: [{ userEmail: 'editor2@test.com', write: false }],
    });
    assert.strictEqual(body3.canRead, true);
    assert.strictEqual(body3.canWrite, false);
    assert.strictEqual(body3.canDelete, false);
  });

  it('ACL groupId __EVERYONE__ gives access like expected', async function () {
    await utils.put('editor', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [{ groupId: consts.EVERYONE_ID, write: true }],
    });

    const body2 = await utils.get('editor2', `/api/queries/${query.id}`);
    assert(body2);
    assert.strictEqual(body2.canRead, true);
    assert.strictEqual(body2.canWrite, true);
    assert.strictEqual(body2.canDelete, false);

    const body3 = await utils.put('editor2', `/api/queries/${query.id}`, {
      ...createQueryBody,
      acl: [{ groupId: consts.EVERYONE_ID, write: false }],
    });
    assert.strictEqual(body3.canRead, true);
    assert.strictEqual(body3.canWrite, false);
    assert.strictEqual(body3.canDelete, false);
  });

  it('Owner can delete query', async function () {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    await utils.del('editor', `/api/queries/${body.id}`);
  });

  it('Admin can delete query', async function () {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    await utils.del('admin', `/api/queries/${body.id}`);
  });

  it('Non-owner cannot delete query', async function () {
    const body = await utils.post('editor', '/api/queries', createQueryBody);
    await utils.del('editor2', `/api/queries/${body.id}`, 403);
  });

  it('ACL does not permit query deletion', async function () {
    const body = await utils.post('editor', '/api/queries', {
      ...createQueryBody,
      acl: [{ userId: consts.EVERYONE_ID, write: true }],
    });
    await utils.del('editor2', `/api/queries/${body.id}`, 403);
  });

  it('supports url parameters', async function () {
    utils = new TestUtils({ appLogLevel: 'error' });
    await utils.init(true);

    const connection1 = await utils.post('admin', '/api/connections', {
      name: 'connection1',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite',
    });
    assert(connection1);
    const connection2 = await utils.post('admin', '/api/connections', {
      name: 'connection2',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite',
    });
    assert(connection2);

    const query1 = await utils.post('editor', '/api/queries', {
      name: 'query1',
      tags: ['one', 'two'],
      connectionId: connection1.id,
      queryText: 'SELECT * FROM some_table -- query1',
      chart: {
        chartType: 'line',
        fields: {
          x: 'field1',
          y: 'field2',
        },
      },
    });

    const query2 = await utils.post('editor2', '/api/queries', {
      name: 'query2',
      tags: ['two', 'three'],
      connectionId: connection2.id,
      queryText: 'SELECT * FROM some_table -- select-query2',
      acl: [{ groupId: '__EVERYONE__' }],
      chart: {
        chartType: 'line',
        fields: {
          x: 'field1',
          y: 'field2',
        },
      },
    });

    // connectionId
    let body;
    let params;
    body = await utils.get(
      'editor',
      `/api/queries?connectionId=${connection1.id}`
    );
    assert.equal(body.length, 1);
    assert(body.find((c) => c.id === query1.id));
    body = await utils.get(
      'editor',
      `/api/queries?connectionId=${connection2.id}`
    );
    assert.equal(body.length, 1);
    assert(body.find((c) => c.id === query2.id));

    // ownedByUser
    body = await utils.get('editor', `/api/queries?ownedByUser=true`);
    assert.equal(body.length, 1);
    assert(body.find((c) => c.id === query1.id));
    body = await utils.get('editor', `/api/queries?ownedByUser=false`);
    assert.equal(body.length, 1);
    assert(body.find((c) => c.id === query2.id));

    // limit & sortBy & offset
    params = queryString.stringify({ limit: 1, sortBy: '+name' });
    body = await utils.get('editor', `/api/queries?${params}`);
    assert.equal(body.length, 1);
    assert.equal(body[0].id, query1.id);
    params = queryString.stringify({ limit: 1, sortBy: '-name' });
    body = await utils.get('editor', `/api/queries?${params}`);
    assert.equal(body.length, 1);
    assert.equal(body[0].id, query2.id);
    params = queryString.stringify({ limit: 1, offset: 1, sortBy: '-name' });
    body = await utils.get('editor', `/api/queries?${params}`);
    assert.equal(body.length, 1);
    assert.equal(body[0].id, query1.id);

    // tags
    params = queryString.stringify(
      { tags: ['one'] },
      { arrayFormat: 'bracket' }
    );
    body = await utils.get('editor', `/api/queries?${params}`);
    assert.equal(body.length, 1);
    assert.equal(body[0].id, query1.id);
    params = queryString.stringify(
      { tags: ['one', 'two'] },
      { arrayFormat: 'bracket' }
    );
    body = await utils.get('editor', `/api/queries?${params}`);
    assert.equal(body.length, 1);
    assert.equal(body[0].id, query1.id);
    params = queryString.stringify(
      { tags: ['two'] },
      { arrayFormat: 'bracket' }
    );
    body = await utils.get('editor', `/api/queries?${params}`);
    assert.equal(body.length, 2);

    // createdBy
    params = queryString.stringify(
      { createdBy: utils.users.editor2.email },
      { arrayFormat: 'bracket' }
    );
    body = await utils.get('editor', `/api/queries?${params}`);
    assert.equal(body.length, 1);
    assert.equal(body[0].id, query2.id);

    // searches
    params = queryString.stringify(
      { search: 'query2' },
      { arrayFormat: 'bracket' }
    );
    body = await utils.get('editor', `/api/queries?${params}`);
    assert.equal(body.length, 1);
    assert.equal(body[0].id, query2.id);
    params = queryString.stringify(
      { search: 'select-query2' },
      { arrayFormat: 'bracket' }
    );
    body = await utils.get('editor', `/api/queries?${params}`);
    assert.equal(body.length, 1);
    assert.equal(body[0].id, query2.id);

    // has link header
    let res = await utils.getResponse('admin', `/api/queries?limit=1`, 200);
    let links = parseLinkHeader(res.header.link);
    assert(links.next);
    assert.equal(links.next.limit, 1);
    assert.equal(links.next.offset, 1);
    assert.equal(links.next.url, '/api/queries?limit=1&offset=1');
    res = await utils.getResponse(
      'admin',
      `/api/queries?limit=1&offset=1`,
      200
    );
    links = parseLinkHeader(res.header.link);
    assert.equal(links.next.limit, 1);
    assert.equal(links.next.offset, 2);
    assert.equal(links.next.url, '/api/queries?limit=1&offset=2');
    assert.equal(links.prev.limit, 1);
    assert.equal(links.prev.offset, 0);
    assert.equal(links.prev.url, '/api/queries?limit=1&offset=0');
  });
});
