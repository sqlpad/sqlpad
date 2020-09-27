function searchTables(tableMap: any, searchRegEx: any) {
  const res: { [key: string]: string } = {};
  Object.keys(tableMap).forEach((tableName) => {
    if (
      searchRegEx.test(tableName) ||
      tableMap[tableName].some((col: any) => searchRegEx.test(col.column_name))
    ) {
      res[tableName] = tableMap[tableName];
    }
  });
  return res;
}

/**
 * Search schemaInfo (the hierarchy object storage of schema data) for the search string passed in
 * @param {object} schemaInfo
 * @param {string} search
 */
export default function searchSchemaInfo(schemaInfo: any, search: any) {
  const filteredSchemaInfo: { [key: string]: any } = {};
  const searchRegEx = new RegExp(search, 'i');

  if (schemaInfo) {
    Object.keys(schemaInfo).forEach((schemaName) => {
      const filteredTableMap = searchTables(
        schemaInfo[schemaName],
        searchRegEx
      );
      filteredSchemaInfo[schemaName] = filteredTableMap;
    });
  }

  return filteredSchemaInfo;
}
