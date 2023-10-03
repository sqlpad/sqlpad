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
 * driver field values on base of object are moved to connection.data
 * @param {object} connection
 */
function validateConnection(connection) {
  // driver fields used to be placed on base object, but have since moved to `data`
  // This needs to support both for v5 to allow for a transition period
  const {
    id,
    name,
    description,
    driver,
    multiStatementTransactionEnabled,
    idleTimeoutSeconds,
    data,
    createdAt,
    updatedAt,
    ...legacyDriverFields
  } = connection;

  if (!name) {
    throw new Error('connection.name required');
  }
  if (!driver) {
    throw new Error('connection.driver required');
  }
  const driverImplementation = drivers[driver];
  if (!driverImplementation) {
    throw new Error(`driver implementation ${driver} not found`);
  }
  const validFields = driverImplementation.fields.map((field) => field.key);

  // If data is provided, use that for driver fields
  // Otherwise use legacy driver fields (the leftovers of fields we do not know about)
  const driverFields = data || legacyDriverFields;

  const cleanConnection = {
    id,
    name,
    description,
    driver,
    multiStatementTransactionEnabled,
    idleTimeoutSeconds,
    createdAt,
    updatedAt,
  };

  const cleanedData = validFields.reduce((cleanedData, fieldKey) => {
    if (driverFields.hasOwnProperty(fieldKey)) {
      let value = driverFields[fieldKey];
      const fieldDefinition = driverImplementation.fields.find(
        (field) => field.key === fieldKey
      );

      if (fieldDefinition) {
        if (fieldDefinition.formType === 'CHECKBOX') {
          value = ensureBoolean(value);
        }
      }

      cleanedData[fieldKey] = value;
    }
    return cleanedData;
  }, {});

  if (cleanedData && Object.keys(cleanedData).length) {
    cleanConnection.data = cleanedData;
  }

  // Strip fields set to undefined
  const evenMoreClean = {};
  Object.keys(cleanConnection).forEach((key) => {
    const value = cleanConnection[key];
    if (value !== undefined) {
      evenMoreClean[key] = value;
    }
  });

  return evenMoreClean;
}

module.exports = validateConnection;
