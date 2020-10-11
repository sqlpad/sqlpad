import { ConnectionSchema } from '../types';

interface SchemaListItem {
  type: 'schema' | 'table' | 'column';
  name: string;
  description?: string;
  id: string;
  parentIds: string[];
  // If a table or column item
  schemaName?: string;
  // If a column item
  tableName?: string;
  dataType?: string;
}

/**
 * To render this schema tree with react-window we'll convert this to a normalized list of sorts
 * Because a tree is basically an indented list.
 *
 * @param schemaInfo
 */
export default function getSchemaList(schemaInfo: ConnectionSchema) {
  const schemaList: SchemaListItem[] = [];

  if (schemaInfo?.schemas) {
    schemaInfo.schemas.forEach((schema) => {
      const schemaId = schema.name;
      schemaList.push({
        type: 'schema',
        name: schema.name,
        description: schema.description,
        id: schemaId,
        parentIds: [],
      });
      schema.tables.forEach((table) => {
        const tableId = `${schema.name}.${table.name}`;
        schemaList.push({
          type: 'table',
          name: table.name,
          description: table.description,
          schemaName: schema.name,
          id: tableId,
          parentIds: [schemaId],
        });
        table.columns.forEach((column) => {
          const columnId = `${schema.name}.${table.name}.${column.name}`;
          schemaList.push({
            type: 'column',
            name: column.name,
            description: column.description,
            dataType: column.dataType,
            tableName: table.name,
            schemaName: schema.name,
            id: columnId,
            parentIds: [schemaId, tableId],
          });
        });
      });
    });
  }

  return schemaList;
}
