const assert = require('assert');
const consts = require('../../lib/consts');
const TestUtils = require('../utils');

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
    const body = await utils.post('editor', '/api/queries', {
      name: 'test query',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      queryText: 'select * from allStuff',
      chartConfiguration: {
        chartType: 'line',
        fields: {
          x: 'field1',
          y: 'field2'
        }
      }
    });

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
      name: 'test query2',
      tags: ['one', 'two'],
      connectionId: 'TODO'
    });

    assert(!body.error, 'no error');
    assert(body.query._id, 'has _id');
    assert.equal(body.query.name, 'test query2');
  });

  it('Owner can get own query', async function() {
    const body = await utils.get('editor', `/api/queries/${query._id}`);
    assert(!body.error, 'no error');
    assert.equal(body.query.name, 'test query2');
  });

  it('Editor2 cannot get query without permission', async function() {
    const body = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(body.error);
  });

  it('Editor2 can get query with specific userId permission', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query._id}`, {
      name: 'test query2',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      acl: [{ userId: utils.users.editor2._id, write: false }]
    });
    assert(!body1.error);

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(!body2.error);
  });

  it('Editor2 can only view without write permission', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query._id}`, {
      name: 'test query2',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      acl: [{ userId: utils.users.editor2._id, write: false }]
    });
    assert(!body1.error);

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(!body2.error);

    const body3 = await utils.put('editor2', `/api/queries/${query._id}`, {
      name: 'test query2',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      acl: [{ userId: utils.users.editor2._id, write: false }]
    });
    assert(body3.error);
  });

  it('Editor2 can update with write permission', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query._id}`, {
      name: 'test query2',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      acl: [{ userId: utils.users.editor2._id, write: true }]
    });
    assert(!body1.error);

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(body2.query);

    const body3 = await utils.put('editor2', `/api/queries/${query._id}`, {
      name: 'test query2',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      acl: [{ userId: utils.users.editor2._id, write: true }]
    });
    assert(!body3.error);
  });

  it('Admin is exempt from query ACL', async function() {
    const body1 = await utils.get('admin', `/api/queries/${query._id}`);
    assert(body1.query);

    const body2 = await utils.get('admin', '/api/queries');
    assert.equal(body2.queries.length, 1);

    const body3 = await utils.put('admin', `/api/queries/${query._id}`, {
      name: 'test query2',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      acl: [{ userId: utils.users.editor2._id, write: true }]
    });
    assert(!body3.error);
  });

  it('Special __EVERYONE__ gives access like expected', async function() {
    const body1 = await utils.put('editor', `/api/queries/${query._id}`, {
      name: 'test query2',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      acl: [{ userId: consts.EVERYONE_ID, write: true }]
    });
    assert(!body1.error);

    const body2 = await utils.get('editor2', `/api/queries/${query._id}`);
    assert(body2.query);

    const body3 = await utils.put('editor2', `/api/queries/${query._id}`, {
      name: 'test query2',
      tags: ['one', 'two'],
      connectionId: 'TODO',
      acl: [{ userId: consts.EVERYONE_ID, write: true }]
    });
    assert(!body3.error);
  });

  it('Requires authentication', function() {
    return utils.get(null, `/api/queries/${query._id}`, 302);
  });

  it('Deletes query', async function() {
    const body = await utils.del('admin', `/api/queries/${query._id}`);
    assert(!body.error, 'no error');
  });

  it('Returns empty array', async function() {
    const body = await utils.get('admin', '/api/queries');
    assert(!body.error, 'Expect no error');
    assert(Array.isArray(body.queries), 'queries is an array');
    assert.equal(body.queries.length, 0, '0 length');
  });
});
