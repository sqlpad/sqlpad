const _ = require('lodash');

function getV1Format(queryResult) {
  if (!queryResult || !queryResult.rows || !queryResult.rows.length) {
    return {};
  }

  // queryResult row casing may not always be consistent with what is specified in query
  // HANA is always uppercase despire aliasing as lower case for example
  // To account for this loop through rows and normalize the case
  const rows = queryResult.rows.map((row) => {
    const cleanRow = {};
    Object.keys(row).forEach((key) => {
      cleanRow[key.toLowerCase()] = row[key];
    });
    return cleanRow;
  });

  const tree = {};
  const bySchema = _.groupBy(rows, 'table_schema');
  for (const schema in bySchema) {
    if (bySchema.hasOwnProperty(schema)) {
      tree[schema] = {};
      const byTableName = _.groupBy(bySchema[schema], 'table_name');
      for (const tableName in byTableName) {
        if (byTableName.hasOwnProperty(tableName)) {
          tree[schema][tableName] = byTableName[tableName];
        }
      }
    }
  }
  /*
  At this point, tree should look like this:
    {
      "schema-name": {
        "table-name": [
          {
            column_name: "the column name",
            data_type: "string"
            column_description: "an optional description"
          }
        ]
      }
    }
  */
  return tree;
}

/**
 * Get an array of table objects from column rows for given schema
 * @param {Object[]} schemaTableColumnRows - rows of column-level data for tables of a given schema
 * @param {string} schemaTableColumnRows[].table_name - field containing table_name
 * @param {string} schemaTableColumnRows[].column_name - field containing column name
 * @param {string} schemaTableColumnRows[].data_type - field containing data type of column
 * @param {string} schemaTableColumnRows[].column_description - field containing description of column
 */
function getTables(schemaTableColumnRows) {
  const tables = [];
  const byTableName = _.groupBy(schemaTableColumnRows, 'table_name');
  for (const tableName in byTableName) {
    if (byTableName.hasOwnProperty(tableName)) {
      const tableObj = {
        name: tableName,
        // TODO populate table description?
        description: '',
        columns: byTableName[tableName].map((row) => {
          return {
            name: row.column_name,
            description: row.column_description,
            dataType: row.data_type,
          };
        }),
      };
      tables.push(tableObj);
    }
  }
  return tables;
}

/**
 * Formats schema query results into
 * a nested map of objects representing schema tree
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
function getV2Format(queryResult) {
  if (!queryResult || !queryResult.rows || !queryResult.rows.length) {
    return {};
  }

  // queryResult row casing may not always be consistent with what is specified in query
  // HANA is always uppercase despire aliasing as lower case for example
  // To account for this loop through rows and normalize the case
  const rows = queryResult.rows.map((row) => {
    const cleanRow = {};
    Object.keys(row).forEach((key) => {
      cleanRow[key.toLowerCase()] = row[key];
    });
    return cleanRow;
  });

  const hasSchema = rows[0].hasOwnProperty('table_schema');

  if (hasSchema) {
    const tree = {
      schemas: [],
    };
    const bySchema = _.groupBy(rows, 'table_schema');
    for (const schema in bySchema) {
      if (bySchema.hasOwnProperty(schema)) {
        const schemaObj = {
          name: schema,
          // TODO populate schema description?
          description: '',
          tables: getTables(bySchema[schema]),
        };
        tree.schemas.push(schemaObj);
      }
    }
    return tree;
  }

  return {
    tables: getTables(rows),
  };
}

/**
 * Formats schema query results into
 * a nested map of objects representing schema tree
 * @param {object} queryResult
 * @param {number} [formatVersion] - optional format version. Should be undefined, 1, or 2
 */
function formatSchemaQueryResults(queryResult, formatVersion) {
  if (!formatVersion || formatVersion === 1) {
    return getV1Format(queryResult);
  }

  if (formatVersion === 2) {
    return getV2Format(queryResult);
  }

  throw new Error('Unexpected format version');
}

module.exports = {
  formatSchemaQueryResults,
};
