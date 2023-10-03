const assert = require('assert');

function getColumn(tree, schemaName, tableName, columnName) {
  const s = tree.schemas.find((s) => s.name === schemaName);
  assert(s, `${schemaName} exists`);
  const t = s.tables.find((t) => t.name === tableName);
  assert(t, `${tableName} exists`);
  const c = t.columns.find((c) => c.name === columnName);
  assert(c, `${columnName} exists`);
  return c;
}

function hasColumnDataType(tree, schemaName, tableName, columnName, dataType) {
  const c = getColumn(tree, schemaName, tableName, columnName);
  if (dataType) {
    assert.strictEqual(c.dataType, dataType, 'column dataType expected');
  }
}

module.exports = {
  getColumn,
  hasColumnDataType,
};
