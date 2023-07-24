import { ConnectionSchema } from '../types';
import { ExpandedMap } from '../stores/editor-store';

interface SchemaListItem {
  type: 'catalog' | 'schema' | 'table' | 'column';
  name: string;
  description?: string;
  id: string;
  // If a column item
  dataType?: string;
  level: number;
}

/**
 * To render this schema tree with react-window
 * we need to convert this tree structure into an indented list
 *
 * @param connectionSchema
 * @param expanded - id -> bool map of items that are expanded
 */
export default function getSchemaList(
  connectionSchema: ConnectionSchema,
  expanded: ExpandedMap
) {
  const schemaList: SchemaListItem[] = [];

  if (connectionSchema?.catalogs) {
    connectionSchema.catalogs.forEach((catalog) => {
      const catalogId = catalog.name;
      schemaList.push({
        type: 'catalog',
        name: catalog.name,
        description: catalog.description,
        id: catalogId,
        level: 0,
      });      
      if (expanded[catalogId]) {
          catalog.schemas.forEach((schema) => {
          const schemaId = `${catalog.name}.${schema.name}`;
          schemaList.push({
            type: 'schema',
            name: schema.name,
            description: schema.description,
            id: schemaId,
            level: 1,
          });
          if (expanded[schemaId]) {
            schema.tables.forEach((table) => {
              const tableId = `${catalog.name}${schema.name}.${table.name}`;
              schemaList.push({
                type: 'table',
                name: table.name,
                description: table.description,
                id: tableId,
                level: 2,
              });
              if (expanded[tableId]) {
                table.columns.forEach((column) => {
                  const columnId = `${catalog.name}${schema.name}.${table.name}.${column.name}`;
                  schemaList.push({
                    type: 'column',
                    name: column.name,
                    description: column.description,
                    dataType: column.dataType,
                    id: columnId,
                    level: 3,
                  });
                });
              }
            });
          }
        });
      }
    });
  } else if (connectionSchema?.schemas) {
    connectionSchema.schemas.forEach((schema) => {
      const schemaId = schema.name;
      schemaList.push({
        type: 'schema',
        name: schema.name,
        description: schema.description,
        id: schemaId,
        level: 0,
      });
      if (expanded[schemaId]) {
        schema.tables.forEach((table) => {
          const tableId = `${schema.name}.${table.name}`;
          schemaList.push({
            type: 'table',
            name: table.name,
            description: table.description,
            id: tableId,
            level: 1,
          });
          if (expanded[tableId]) {
            table.columns.forEach((column) => {
              const columnId = `${schema.name}.${table.name}.${column.name}`;
              schemaList.push({
                type: 'column',
                name: column.name,
                description: column.description,
                dataType: column.dataType,
                id: columnId,
                level: 2,
              });
            });
          }
        });
      }
    });
  } else if (connectionSchema.tables) {
    connectionSchema.tables.forEach((table) => {
      const tableId = table.name;
      schemaList.push({
        type: 'table',
        name: table.name,
        description: table.description,
        id: tableId,
        level: 0,
      });
      if (expanded[tableId]) {
        table.columns.forEach((column) => {
          const columnId = `${table.name}.${column.name}`;
          schemaList.push({
            type: 'column',
            name: column.name,
            description: column.description,
            dataType: column.dataType,
            id: columnId,
            level: 1,
          });
        });
      }
    });
  }

  return schemaList;
}
