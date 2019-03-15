const _ = require('lodash');

/**
 * Formats schema query results into
 * a nested map of objects representing schema tree
 * @param {object} queryResult
 */
function formatSchemaQueryResults(queryResult) {
  if (!queryResult || !queryResult.rows || !queryResult.rows.length) {
    return {};
  }

  // queryResult row casing may not always be consistent with what is specified in query
  // HANA is always uppercase despire aliasing as lower case for example
  // To account for this loop through rows and normalize the case
  const rows = queryResult.rows.map(row => {
    const cleanRow = {};
    Object.keys(row).forEach(key => {
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
          }
        ]
      }
    }
  */
  return tree;
}

/**
 * Clean value to boolean
 * If value is not a boolean or can't be converted, an error is thrown
 * This is probably unnecessary but more a precaution
 * @param {any} value
 */
function ensureBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string' && value.toLowerCase() === 'true') {
    return true;
  } else if (typeof value === 'string' && value.toLowerCase() === 'false') {
    return false;
  } else if (value === 1) {
    return true;
  } else if (value === 0) {
    return false;
  }
  throw new Error(`Unexpected value for boolean: ${value}`);
}

module.exports = {
  ensureBoolean,
  formatSchemaQueryResults
};
