const assert = require('assert');
const testUtils = require('../test-utils.js');
const pinot = require('./index.js');

const connection = {
  name: 'test pinot',
  driver: 'pinot',
  controllerUrl: 'http://localhost:9000',
};

// Pinot docker image comes with quickstart with bootstrapped table `baseballStats`
// These tests could break in future if Pinot no longer supplies this table

describe('drivers/pinot', function () {
  it('tests connection', function () {
    return pinot.testConnection(connection);
  });

  it('getSchema()', async function () {
    const schemaInfo = await pinot.getSchema(connection);
    const column = testUtils.getColumn(
      schemaInfo,
      'main',
      'baseballStats',
      'playerID'
    );
    assert(column.hasOwnProperty('dataType'));
  });

  it('runQuery under limit', async function () {
    const results = await pinot.runQuery(
      `
        SELECT playerID 
        FROM baseballStats 
        WHERE playerID = 'aardsda01' 
        LIMIT 1
      `,
      connection
    );

    assert(!results.incomplete, 'not incomplete');
    assert.equal(results.rows.length, 1, 'rows length');
  });

  it('runQuery over limit', async function () {
    const limitedConnection = { ...connection, maxRows: 2 };
    const results = await pinot.runQuery(
      'SELECT * FROM baseballStats LIMIT 10',
      limitedConnection
    );

    assert(results.incomplete, 'incomplete');
    assert.equal(results.rows.length, 2, 'row length');
  });

  it('returns descriptive error message', function () {
    let error;
    return pinot
      .runQuery('SELECT * FROM missing_table', { ...connection, maxRows: 10 })
      .catch((e) => {
        error = e;
      })
      .then(() => {
        assert(error);
        assert(error.toString().indexOf('BrokerResourceMissingError') > -1);
      });
  });

  it('handles non-json error response', function () {
    // This query returns an API response that isn't JSON
    const query = `
        select
        baseballStats.playerID, 
        sum(baseOnBalls) as sum_bob
      from
        baseballStats
      group by
        playerID
      order by sum_bob desc
    `;
    let error;
    return pinot
      .runQuery(query, { ...connection, maxRows: 10 })
      .catch((e) => {
        error = e;
      })
      .then(() => {
        assert(error);
        assert(error.toString().indexOf('baseballStats.playerID') > -1);
      });
  });
});
