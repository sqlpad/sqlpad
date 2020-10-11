import { ConnectionSchema, Schema, SchemaTable } from '../types';

function searchTables(tables: SchemaTable[], searchRegEx: RegExp) {
  const res: SchemaTable[] = [];
  tables.forEach((table) => {
    if (
      searchRegEx.test(table.name) ||
      table.columns.some((col) => searchRegEx.test(col.name))
    ) {
      res.push(table);
    }
  });
  return res;
}

/**
 * Search connectionSchema (the hierarchy object storage of schema data) for the search string passed in
 * @param connectionSchema
 * @param  search
 */
export default function searchSchemaInfo(
  connectionSchema: ConnectionSchema,
  search: string
) {
  const filteredSchemas: Schema[] = [];
  const searchRegEx = new RegExp(search, 'i');

  if (connectionSchema?.schemas) {
    connectionSchema.schemas.forEach((schema) => {
      const filteredTables = searchTables(schema.tables, searchRegEx);
      const filteredSchema = { ...schema, tables: filteredTables };
      filteredSchemas.push(filteredSchema);
    });
  }
  // TODO what if only tables

  return { schemas: filteredSchemas } as ConnectionSchema;
}
