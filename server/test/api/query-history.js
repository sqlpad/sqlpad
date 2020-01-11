const assert = require('assert');
const utils = require('../utils');
const urlFilterToNeDbFilter = require('../../lib/urlFilterToNeDbFilter');

const queryText1 = `
  -- QUERY1
  -- dimensions = department 10, orderdate 10
  -- measures = cost, revenue, profit
  -- orderby = department desc, orderdate asc
  -- limit = 100
`;

const queryText2 = `
  -- QUERY2
  -- dimensions = department 10, orderdate 10
  -- measures = cost, revenue, profit
  -- orderby = department desc, orderdate asc
  -- limit = 100
`;

describe('api/query-history', function() {
  let connection;
  let query1;

  before(async function() {
    await utils.resetWithUser();

    const connBody = await utils.post('admin', '/api/connections', {
      name: 'test postgres',
      driver: 'mock',
      host: 'localhost',
      database: 'sqlpad',
      username: 'sqlpad',
      password: 'sqlpad'
    });
    connection = connBody.connection;

    const body = await utils.post('admin', '/api/queries', {
      name: 'test query 1',
      tags: ['test', 'postgres'],
      connectionId: connection._id,
      queryText: queryText1
    });
    query1 = body.query;
  });

  it('Convert URL filters to NeDB compatibles', function() {
    // String operators
    assert.deepEqual(urlFilterToNeDbFilter('field1|regex|myPattern'), {
      $and: [{ field1: { $regex: new RegExp('myPattern') } }]
    });

    // Numeric operators
    assert.deepEqual(urlFilterToNeDbFilter('field1|lt|123'), {
      $and: [{ field1: { $lt: 123 } }]
    });
    assert.deepEqual(urlFilterToNeDbFilter('field1|gt|123'), {
      $and: [{ field1: { $gt: 123 } }]
    });
    assert.deepEqual(urlFilterToNeDbFilter('field1|ne|123'), {
      $and: [{ field1: { $ne: 123 } }]
    });
    assert.deepEqual(urlFilterToNeDbFilter('field1|eq|123'), {
      $and: [{ field1: 123 }]
    });

    // Datetime operators
    assert.deepEqual(urlFilterToNeDbFilter('field1|before|2020-03-01'), {
      $and: [{ field1: { $lt: new Date('2020-03-01T00:00:00.000Z') } }]
    });
    assert.deepEqual(
      urlFilterToNeDbFilter('field1|before|2020-03-01 00:00:00'),
      {
        $and: [{ field1: { $lt: new Date('2020-03-01T00:00:00.000Z') } }]
      }
    );
    assert.deepEqual(urlFilterToNeDbFilter('field1|after|2020-03-01'), {
      $and: [{ field1: { $gt: new Date('2020-03-01T00:00:00.000Z') } }]
    });
    assert.deepEqual(
      urlFilterToNeDbFilter('field1|after|2020-03-01 00:00:00'),
      {
        $and: [{ field1: { $gt: new Date('2020-03-01T00:00:00.000Z') } }]
      }
    );

    // Multiple filter conditions
    const multiUrlFilter =
      'field1|eq|500,field2|regex|myPattern,field3|before|2020-03-01';
    assert.deepEqual(urlFilterToNeDbFilter(multiUrlFilter), {
      $and: [
        { field1: 500 },
        { field2: { $regex: new RegExp('myPattern') } },
        { field3: { $lt: new Date('2020-03-01T00:00:00.000Z') } }
      ]
    });
  });

  it('Gets array of 0 items', async function() {
    const body = await utils.get('admin', '/api/query-history');
    assert(!body.error, 'Expect no error');
    assert(Array.isArray(body.queryHistory.rows), 'queryHistory is an array');
    assert.equal(body.queryHistory.incomplete, false, 'Complete');
    assert.equal(body.queryHistory.rows.length, 0, '0 length');
  });

  it('Gets array of 4 items', async function() {
    // Run some queries to generate query history by saved queries
    await utils.get('admin', `/api/query-result/${query1._id}`);
    await utils.get('admin', `/api/query-result/${query1._id}`);

    // Run some queries to generate query history directly from the query editor
    await utils.post('admin', `/api/query-result`, {
      connectionId: connection._id,
      cacheKey: 'cachekey',
      queryText: queryText2
    });
    await utils.post('admin', `/api/query-result`, {
      connectionId: connection._id,
      cacheKey: 'cachekey',
      queryText: queryText2
    });

    // Check if every query stored in query history
    const body = await utils.get('admin', '/api/query-history');
    assert(!body.error, 'Expect no error');
    assert(Array.isArray(body.queryHistory.rows), 'queryHistory is an array');
    assert.equal(body.queryHistory.incomplete, false, 'Complete');
    assert.equal(body.queryHistory.rows.length, 4, '4 length');

    // Check if every history entry has every required key
    const historyObjectKeys = [
      'userEmail',
      'connectionName',
      'startTime',
      'stopTime',
      'queryRunTime',
      'queryId',
      'queryName',
      'queryText',
      'incomplete',
      'rowCount',
      'createdDate'
    ];

    // First and second two history items (reverse ordered) needs to free text query with queryId and queryName
    assert.deepEqual(Object.keys(body.queryHistory.rows[3]), historyObjectKeys);
    assert.deepEqual(Object.keys(body.queryHistory.rows[2]), historyObjectKeys);

    // Third and fourth history items (reverse ordered) needs to saved text query with no queryId and queryName
    historyObjectKeys.splice(historyObjectKeys.indexOf('queryId'), 1);
    historyObjectKeys.splice(historyObjectKeys.indexOf('queryName'), 1);
    assert.deepEqual(Object.keys(body.queryHistory.rows[1]), historyObjectKeys);
    assert.deepEqual(Object.keys(body.queryHistory.rows[0]), historyObjectKeys);
  });

  it('Gets filtered array of 2 items', async function() {
    // Check if filters applied correctly
    const body = await utils.get(
      'admin',
      '/api/query-history?filter=queryText|regex|QUERY2'
    );

    assert(!body.error, 'Expect no error');
    assert(Array.isArray(body.queryHistory.rows), 'queryHistory is an array');
    assert.equal(body.queryHistory.incomplete, false, 'Complete');
    assert.equal(body.queryHistory.rows.length, 2, '2 length');
  });
});
