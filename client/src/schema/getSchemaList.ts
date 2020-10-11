import { ConnectionSchema } from '../types';

interface SchemaListItem {
  type: 'schema' | 'table' | 'column';
  name: string;
  description?: string;
  id: string;
  parentIds: string[];
  // If a column item
  dataType?: string;
}

/**
 * To render this schema tree with react-window we'll convert this to a normalized list of sorts
 * Because a tree is basically an indented list.
 *
 * @param connectionSchema
 */
export default function getSchemaList(connectionSchema: ConnectionSchema) {
  const schemaList: SchemaListItem[] = [];

  if (connectionSchema?.schemas) {
    connectionSchema.schemas.forEach((schema) => {
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
            id: columnId,
            parentIds: [schemaId, tableId],
          });
        });
      });
    });
  } else if (connectionSchema.tables) {
    connectionSchema.tables.forEach((table) => {
      const tableId = table.name;
      schemaList.push({
        type: 'table',
        name: table.name,
        description: table.description,
        id: tableId,
        parentIds: [],
      });
      table.columns.forEach((column) => {
        const columnId = `${table.name}.${column.name}`;
        schemaList.push({
          type: 'column',
          name: column.name,
          description: column.description,
          dataType: column.dataType,
          id: columnId,
          parentIds: [tableId],
        });
      });
    });
  }

  return schemaList;
}
