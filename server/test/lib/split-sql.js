const assert = require('assert');
const splitSql = require('../../lib/split-sql');

describe('lib/splitSql', function() {
  it('handles single query without separator', function() {
    const query = 'SELECT value FROM some_table';
    const queries = splitSql(query);
    assert.strictEqual(queries.length, 1);
    assert.strictEqual(queries[0], query);
  });

  it('handles single query with separator', function() {
    const query = 'SELECT value FROM some_table;';
    const queries = splitSql(query);
    assert.strictEqual(queries.length, 1);
    assert.strictEqual(queries[0], query);
  });

  it('handles queries without comments', function() {
    const q1 = 'SELECT value FROM some_table;';
    const q2 = 'SELECT value FROM another_table;';
    const noComments = `${q1}\n${q2}`;
    const queries = splitSql(noComments);
    assert.strictEqual(queries.length, 2);
    assert.strictEqual(queries[0], q1);
    assert.strictEqual(queries[1], q2);
  });

  it('handles complex comments', function() {
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

    const comments = q1 + '\n' + q2;

    const queries = splitSql(comments);
    assert.strictEqual(queries.length, 2);
    assert.strictEqual(queries[0], q1);
    assert.strictEqual(queries[1], q2);
  });

  it('handles string literals', function() {
    const stringLiteral = `
      SELECT listagg(DISTINCT t.field, '; ') AS my_agg
      FROM some_table t
    `.trim();

    const queries = splitSql(stringLiteral);
    assert.strictEqual(queries.length, 1);
    assert.strictEqual(queries[0], stringLiteral);
  });

  it('handles escaped string literals', function() {
    const query = `
      SELECT 'little bobby ;'';tables;''' AS quoted_string;
    `.trim();

    const queries = splitSql(query);
    assert.strictEqual(queries.length, 1);
    assert.strictEqual(queries[0], query);
  });
});
