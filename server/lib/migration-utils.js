/**
 * Allows creating idempotentish migrations that include index creation.
 * The queryInterface does not have a create index if not exists option,
 * so this creates that.
 *
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {String} tableName
 * @param {String} indexName
 * @param {Array<String>} fields - array of field names
 * @param {object} [options] - additional options to apply to addIndex
 */
async function addOrReplaceIndex(
  queryInterface,
  tableName,
  indexName,
  fields,
  options = {}
) {
  const indexes = await queryInterface.showIndex(tableName);

  const found = indexes.find((index) => index.name === indexName);

  // If not found create the index
  if (!found) {
    return queryInterface.addIndex(tableName, {
      fields,
      name: indexName,
      ...options,
    });
  }

  // If found, figure out if it is the *same* index
  // If it is the same, do nothing
  // Name and table already match, but the fields need to as well
  // fields is something like [ { attribute: 'colname', length: undefined, order: undefined } ]
  // Unsure if length/order are populated. They are not for sqlite.
  // we'll assume order in array is order of fields
  let sameIndex = true;
  if (fields.length !== found.fields.length) {
    sameIndex = false;
  } else {
    // iterate and check
    fields.forEach((field, index) => {
      const indexCol = found.fields[index];
      if (!indexCol || field !== indexCol.attribute) {
        sameIndex = false;
      }
    });
  }

  if (!sameIndex) {
    await queryInterface.removeIndex(tableName, indexName);
    await queryInterface.addIndex(tableName, {
      fields,
      name: indexName,
      ...options,
    });
  }
}

module.exports = {
  addOrReplaceIndex,
};
