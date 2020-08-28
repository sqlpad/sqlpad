function searchTables(tableMap: any, searchRegEx: any) {
  const res = {};
  Object.keys(tableMap).forEach((tableName) => {
    if (
      searchRegEx.test(tableName) ||
      tableMap[tableName].some((col: any) => searchRegEx.test(col.column_name))
    ) {
      // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
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
  const filteredSchemaInfo = {};
  const searchRegEx = new RegExp(search, 'i');

  if (schemaInfo) {
    Object.keys(schemaInfo).forEach((schemaName) => {
      const filteredTableMap = searchTables(
        schemaInfo[schemaName],
        searchRegEx
      );
      // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
      filteredSchemaInfo[schemaName] = filteredTableMap;
    });
  }

  return filteredSchemaInfo;
}
