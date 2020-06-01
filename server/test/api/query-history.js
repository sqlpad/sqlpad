const assert = require('assert');
const { Op } = require('sequelize');
const TestUtils = require('../utils');
const urlFilterToDbFilter = require('../../lib/url-filter-to-db-filter');

const queryText1 = `
  -- QUERY1
  SELECT * 
  FROM vw_sales 
  ORDER BY id 
  LIMIT 10
`;

const queryText2 = `
  -- QUERY2
  SELECT * 
  FROM vw_sales 
  ORDER BY id 
  LIMIT 10
`;

describe('api/query-history', function () {
  const utils = new TestUtils();
  let connection;
  let query1;

  before(async function () {
    await utils.init(true);

    connection = await utils.post('admin', '/api/connections', {
      name: 'test postgres',
      driver: 'sqlite',
      data: {
        filename: './test/fixtures/sales.sqlite',
      },
    });

    query1 = await utils.post('admin', '/api/queries', {
      name: 'test query 1',
      tags: ['test', 'postgres'],
      connectionId: connection.id,
      queryText: queryText1,
    });
  });

  it('Convert URL filters to NeDB compatibles', function () {
    // String operators
    assert.deepEqual(urlFilterToDbFilter('field1|regex|myPattern'), {
      [Op.and]: [{ field1: { [Op.regexp]: new RegExp('myPattern') } }],
    });

    // Numeric operators
    assert.deepEqual(urlFilterToDbFilter('field1|lt|123'), {
      [Op.and]: [{ field1: { [Op.lt]: 123 } }],
    });
    assert.deepEqual(urlFilterToDbFilter('field1|gt|123'), {
      [Op.and]: [{ field1: { [Op.gt]: 123 } }],
    });
    assert.deepEqual(urlFilterToDbFilter('field1|ne|123'), {
      [Op.and]: [{ field1: { [Op.ne]: 123 } }],
    });
    assert.deepEqual(urlFilterToDbFilter('field1|eq|123'), {
      [Op.and]: [{ field1: 123 }],
    });

    // Datetime operators
    assert.deepEqual(urlFilterToDbFilter('field1|before|2020-03-01'), {
      [Op.and]: [{ field1: { [Op.lt]: new Date('2020-03-01') } }],
    });
    assert.deepEqual(urlFilterToDbFilter('field1|before|2020-03-01 00:00:00'), {
      [Op.and]: [{ field1: { [Op.lt]: new Date('2020-03-01 00:00:00') } }],
    });
    assert.deepEqual(urlFilterToDbFilter('field1|after|2020-03-01'), {
      [Op.and]: [{ field1: { [Op.gt]: new Date('2020-03-01') } }],
    });
    assert.deepEqual(urlFilterToDbFilter('field1|after|2020-03-01 00:00:00'), {
      [Op.and]: [{ field1: { [Op.gt]: new Date('2020-03-01 00:00:00') } }],
    });

    // Multiple filter conditions
    const multiUrlFilter =
      'field1|eq|500,field2|regex|myPattern,field3|before|2020-03-01';
    assert.deepEqual(urlFilterToDbFilter(multiUrlFilter), {
      [Op.and]: [
        { field1: 500 },
        { field2: { [Op.regexp]: new RegExp('myPattern') } },
        { field3: { [Op.lt]: new Date('2020-03-01') } },
      ],
    });
  });

  it('Gets array of 0 items', async function () {
    const body = await utils.get('admin', '/api/query-history');
    TestUtils.validateListSuccessBody(body);
    assert.equal(body.length, 0, '0 length');
  });

  it('Gets array of 4 items', async function () {
    // Run some queries to generate query history by saved
    await utils.post('admin', `/api/batches`, {
      connectionId: connection.id,
      queryId: query1.id,
      queryName: 'test query',
      batchText: query1.queryText,
      selectedText: query1.queryText,
    });
    await utils.post('admin', `/api/batches`, {
      connectionId: connection.id,
      queryId: query1.id,
      queryName: 'test query',
      batchText: query1.queryText,
      selectedText: query1.queryText,
    });
    await utils.post('editor', `/api/batches`, {
      connectionId: connection.id,
      batchText: queryText2,
      selectedText: queryText2,
    });
    await utils.post('editor', `/api/batches`, {
      connectionId: connection.id,
      batchText: queryText2,
      selectedText: queryText2,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if every query stored in query history
    const body = await utils.get('admin', '/api/query-history');
    assert.equal(body.length, 4, '4 length');

    // Check if every history entry has every required key
    let historyObjectKeys = [
      'id',
      'connectionId',
      'connectionName',
      'userId',
      'userEmail',
      'startTime',
      'stopTime',
      'durationMs',
      'queryId',
      'queryName',
      'queryText',
      'incomplete',
      'rowCount',
    ];

    // First and second two history items (reverse ordered) needs to free text query with queryId and queryName
    assert.deepEqual(Object.keys(body[3]), historyObjectKeys);
    assert.deepEqual(Object.keys(body[2]), historyObjectKeys);

    // Third and fourth history items (reverse ordered) needs to saved text query with no queryId and queryName
    assert.deepEqual(Object.keys(body[1]), historyObjectKeys);
    assert.deepEqual(Object.keys(body[0]), historyObjectKeys);
  });

  it('Gets filtered array of 2 items', async function () {
    // Check if filters applied correctly
    const body = await utils.get(
      'admin',
      '/api/query-history?filter=queryText|like|%25QUERY2%25'
    );
    assert.equal(body.length, 2, '2 length');
  });

  it('Non-admin can only see own history', async function () {
    const body = await utils.get('editor', '/api/query-history');
    assert.equal(body.length, 2, '2 length');
    assert.equal(body[0].queryText, queryText2);
  });
});
