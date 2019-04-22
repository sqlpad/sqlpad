function searchTables(tableMap, searchRegEx) {
  const res = {};
  Object.keys(tableMap).forEach(tableName => {
    if (
      searchRegEx.test(tableName) ||
      tableMap[tableName].some(col => searchRegEx.test(col.column_name))
    ) {
      res[tableName] = tableMap[tableName];
    }
  });
  return res;
}

/**
 * To render this schema tree with react-virtualized we'll convert this to a normalized list of sorts
 * Because a tree is basically an indented list...?
 * @param {object} schemaInfo
 * @param {string} search
 */
export default function searchSchemaInfo(schemaInfo, search) {
  const filteredSchemaInfo = {};
  const searchRegEx = new RegExp(search, 'i');

  if (schemaInfo) {
    Object.keys(schemaInfo).forEach(schemaName => {
      const filteredTableMap = searchTables(
        schemaInfo[schemaName],
        searchRegEx
      );
      filteredSchemaInfo[schemaName] = filteredTableMap;
    });
  }

  return filteredSchemaInfo;
}
