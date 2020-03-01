const drivers = require('../drivers');

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

/**
 * Validates connection object based on its driver
 * Unnecessary fields will be stripped out
 * @param {object} connection
 */
function validateConnection(connection) {
  const coreFields = ['_id', 'name', 'driver', 'createdDate', 'modifiedDate'];
  if (!connection.name) {
    throw new Error('connection.name required');
  }
  if (!connection.driver) {
    throw new Error('connection.driver required');
  }
  const driver = drivers[connection.driver];
  if (!driver) {
    throw new Error(`driver implementation ${connection.driver} not found`);
  }
  const validFields = driver.fields.map(field => field.key).concat(coreFields);
  const cleanedConnection = validFields.reduce(
    (cleanedConnection, fieldKey) => {
      if (connection.hasOwnProperty(fieldKey)) {
        let value = connection[fieldKey];
        const fieldDefinition = driver.fields.find(
          field => field.key === fieldKey
        );

        // field definition may not exist since
        // this could be a core field like _id, name
        if (fieldDefinition) {
          if (fieldDefinition.formType === 'CHECKBOX') {
            value = ensureBoolean(value);
          }
        }

        cleanedConnection[fieldKey] = value;
      }
      return cleanedConnection;
    },
    {}
  );

  return cleanedConnection;
}

module.exports = validateConnection;
