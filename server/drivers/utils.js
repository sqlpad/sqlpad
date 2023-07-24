const appLog = require('../lib/app-log');

/**
 * Formats flat schema query results into a hierarchy
 *
 * Expected input is
 * {
 *   rows: [
 *     {
 *       schema_name: '',          // or table_schema. optional. name of schema if DB uses schemas
 *       schema_description: '',   // description of schema. optional.
 *       table_name: '',           // name of table.
 *       table_description: '',    // description of table. optional.
 *       column_name: '',          // name of column.
 *       column_description: '',   // description of column. optional.
 *       data_type: '',            // data type of column
 *     }
 *   ]
 * }
 *
 * Returned format is
 * {
 *   schemas: [
 *     {
 *       name: '',
 *       description: '',
 *       tables: [
 *         {
 *           name: '',
 *           description: '',
 *           columns: [
 *             {
 *               name: '',
 *               description: '',
 *               dataType: ''
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * @param {object} queryResult
 * @param {array} [queryResult.rows]
 */
function formatSchemaQueryResults(queryResult) {
  if (!queryResult || !queryResult.rows || !queryResult.rows.length) {
    return {};
  }

  appLog.warn("formatSchemaQueryResults = " + JSON.stringify(queryResult));
  if (queryResult.rows[0].table_catalog) {
    return formatSchemaQueryResultsWithCatalog(queryResult);
  }

  // IDs will be full paths of objects
  // `schemaname`, `schemaname.tablename`
  let hasSchema = false;
  const schemasById = {};
  const tablesById = {};

  for (const row of queryResult.rows) {
    // queryResult row casing may not always be consistent with what is specified in query
    // HANA is always uppercase despire aliasing as lower case for example
    // For example a row from HANA might be { TABLE_SCHEMA: 'name' } instead of { table_schema: 'name' } expected
    // To account for this loop through rows and normalize the case
    const cleanRow = {};
    Object.keys(row).forEach((key) => {
      cleanRow[key.toLowerCase()] = row[key];
    });

    // Originally information schemas returned a field "table_schema" for schema name
    // "schema_name" fits better and is more consistent
    // This supports both fields, preferring schema_name if set;
    const schemaName = cleanRow.schema_name || cleanRow.table_schema;
    const schemaDescription = cleanRow.schema_description;
    const tableName = cleanRow.table_name;
    const tableDescription = cleanRow.table_description;
    const columnName = cleanRow.column_name;
    const dataType = cleanRow.data_type;
    const columnDescription = cleanRow.column_description;

    const schemaId = schemaName;
    const tableId = schemaName ? `${schemaName}.${tableName}` : undefined;

    // If schema exists and hasn't been added to index yet, add it
    if (schemaId && !schemasById[schemaId]) {
      hasSchema = true;
      schemasById[schemaId] = {
        name: schemaName,
        description: schemaDescription,
        tables: [],
        // temporary index to make it efficient to add tables
        tablesById: {},
      };
    }

    // If table hasn't been captured in index yet, add it
    if (!tablesById[tableId]) {
      const table = {
        name: tableName,
        description: tableDescription,
        columns: [],
      };
      tablesById[tableId] = table;

      // If schema exists and table is not yet there, add it to schema
      // Its pushed to tables array for final product, and added to tablesById map
      // so final operation can remove tablesById map and not have to iterate the list again
      if (schemaId && !schemasById[schemaId].tablesById[tableId]) {
        schemasById[schemaId].tables.push(table);
        schemasById[schemaId].tablesById[tableId] = table;
      }
    }

    const column = {
      name: columnName,
      description: columnDescription,
      dataType,
    };

    tablesById[tableId].columns.push(column);
  }

  // If schema is present, loop over values and remove the tablesById
  // The resulting array will be in the format needed
  if (hasSchema) {
    return {
      schemas: Object.values(schemasById).map((schema) => {
        delete schema.tablesById;
        return schema;
      }),
    };
  }

  // If there was no schema, tablesById has everything needed
  return {
    tables: Object.values(tablesById),
  };
}


/**
 * Formats flat schema query results into a hierarchy. This version assumes catalog names are
 * present. An additional level of nested is created.
 *
 * Expected input is
 * {
 *   rows: [
 *     {
 *       table_catalog: '',         // name of catalog.
 *       catalog_description: '',  // description of catalog. optional.
 *       schema_name: '',          // or table_schema. optional. name of schema if DB uses schemas
 *       schema_description: '',   // description of schema. optional.
 *       table_name: '',           // name of table.
 *       table_description: '',    // description of table. optional.
 *       column_name: '',          // name of column.
 *       column_description: '',   // description of column. optional.
 *       data_type: '',            // data type of column
 *     }
 *   ]
 * }
 *
 * Returned format is
 * {
 *   catalogs: [
 *     {
 *       name: '',
 *       description: '',
 *       schemas: [
 *         {
 *           name: '',
 *           description: '',
 *           tables: [
 *             {
 *               name: '',
 *               description: '',
 *               columns: [
 *                 {
 *                   name: '',
 *                   description: '',
 *                   dataType: ''
 *                 }
 *               ]
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * @param {object} queryResult
 * @param {array} [queryResult.rows]
 */
function formatSchemaQueryResultsWithCatalog(queryResult) {
  // IDs will be full paths of objects
  // `catalogname`, `catalogname.schemaname`, `catalogname.schemaname.tablename`
  const catalogsById = {};
  const schemasById = {};
  const tablesById = {};

  for (const row of queryResult.rows) {
    // queryResult row casing may not always be consistent with what is specified in query
    // HANA is always uppercase despire aliasing as lower case for example
    // For example a row from HANA might be { TABLE_SCHEMA: 'name' } instead of { table_schema: 'name' } expected
    // To account for this loop through rows and normalize the case
    const cleanRow = {};
    Object.keys(row).forEach((key) => {
      cleanRow[key.toLowerCase()] = row[key];
    });

    // Originally information schemas returned a field "table_schema" for schema name
    // "schema_name" fits better and is more consistent
    // This supports both fields, preferring schema_name if set;
    const catalogName = cleanRow.table_catalog;
    const schemaName = cleanRow.schema_name || cleanRow.table_schema;
    const schemaDescription = cleanRow.schema_description;
    const tableName = cleanRow.table_name;
    const tableDescription = cleanRow.table_description;
    const columnName = cleanRow.column_name;
    const dataType = cleanRow.data_type;
    const columnDescription = cleanRow.column_description;

    appLog.warn("formatSchemaQueryResultsWithCatalog row = " + JSON.stringify(cleanRow));

    const catalogId = catalogName;
    const schemaId = `${catalogName}.${schemaName}`;
    const tableId = `${catalogName}.${schemaName}.${tableName}`;

    // If catalog exists and hasn't been added to index yet, add it
    if (!catalogsById[catalogId]) {
      appLog.warn("adding catalog = " + catalogId);      
      catalogsById[catalogId] = {
        name: catalogName,
        description: '',
        schemas: [],
      };
    }

    // If schema exists and hasn't been added to index yet, add it
    if (!schemasById[schemaId]) {
      appLog.warn("adding schema = " + schemaId);      
      const schema = {
        name: schemaName,
        description: schemaDescription,
        tables: [],
      };
      schemasById[schemaId] = schema
      catalogsById[catalogId].schemas.push(schema);
    }

    // If table hasn't been captured in index yet, add it
    if (!tablesById[tableId]) {
      appLog.warn("adding table = " + tableId);      
      const table = {
        name: tableName,
        description: tableDescription,
        columns: [],
      };
      tablesById[tableId] = table;
      schemasById[schemaId].tables.push(table);
    }

    appLog.warn("adding column = " + columnName);      
    const column = {
      name: columnName,
      description: columnDescription,
      dataType,
    };

    tablesById[tableId].columns.push(column);
  }

  appLog.warn("result = " + JSON.stringify(Object.values(catalogsById)));      
  
  return {
    catalogs: Object.values(catalogsById),
  };  
}

module.exports = {
  formatSchemaQueryResults,
};
