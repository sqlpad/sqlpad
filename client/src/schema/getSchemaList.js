/**
 * To render this schema tree with react-window we'll convert this to a normalized list of sorts
 * Because a tree is basically an indented list...?
 *
 * schemaInfo looks like
 * {
 *   schemaName: {
 *     tableName: [
 *       { column_name, column_description, data_type, table_name, table_schema }
 *     ]
 *   }
 * }
 *
 * @param {object} schemaInfo
 */
export default function getSchemaList(schemaInfo) {
  const schemaList = [];

  if (schemaInfo) {
    Object.keys(schemaInfo).forEach((schemaName) => {
      const schemaId = schemaName;
      schemaList.push({
        type: 'schema',
        name: schemaName,
        id: schemaId,
        parentIds: [],
      });
      Object.keys(schemaInfo[schemaName]).forEach((tableName) => {
        const tableId = `${schemaName}.${tableName}`;
        schemaList.push({
          type: 'table',
          name: tableName,
          schemaName,
          id: tableId,
          parentIds: [schemaId],
        });
        schemaInfo[schemaName][tableName].forEach((column) => {
          const columnId = `${schemaName}.${tableName}.${column.column_name}`;
          schemaList.push({
            type: 'column',
            name: column.column_name,
            description: column.column_description,
            dataType: column.data_type,
            tableName,
            schemaName,
            id: columnId,
            parentIds: [schemaId, tableId],
          });
        });
      });
    });
  }

  return schemaList;
}
