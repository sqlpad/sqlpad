const assert = require('assert');
const splitSql = require('../../lib/splitSql');

const singleNoSeparator = `
SELECT value 
FROM some_table
`.trim();

const singleWithSeparator = `
SELECT value 
FROM some_table;
`.trim();

const noComments = `
SELECT value FROM some_table;
SELECT value FROM another_table;
`.trim();

const q1 = `
-- this is a comment; it has;stuff
SELECT value FROM some_table;
`.trim();

const q2 = `
/* this query is commented out SELECT SOMETHING ELSE; */
/* And this one too
look even an unlikely comment starter again /*
SELECT * FROM not a query; --SELECT * FROM not a query;
*/

SELECT 
  value 
  --SELECT * FROM not a query;
FROM 
  another_table;
`.trim();

const comments = q1 + q2;

describe('lib/splitSql', function() {
  it('handles single query without separator', function() {
    const queries = splitSql(singleNoSeparator);
    assert.strictEqual(queries.length, 1);
    assert.strictEqual(queries[0], singleNoSeparator);
  });

  it('handles single query with separator', function() {
    const queries = splitSql(singleWithSeparator);
    assert.strictEqual(queries.length, 1);
    assert.strictEqual(queries[0], singleWithSeparator);
  });

  it('handles queries without comments', function() {
    const queries = splitSql(noComments);
    assert.strictEqual(queries.length, 2);
    assert.strictEqual(queries[0], 'SELECT value FROM some_table;');
    assert.strictEqual(queries[1], 'SELECT value FROM another_table;');
  });
  it('handles comples comments', function() {
    const queries = splitSql(comments);
    assert.strictEqual(queries.length, 2);
    assert.strictEqual(queries[0], q1);
    assert.strictEqual(queries[1], q2);
  });
});
