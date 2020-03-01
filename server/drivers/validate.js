/**
 * Validate that the driver implementation has a function by name provided
 * @param {object} driver
 * @param {string} functionName
 */
function validateFunction(driver, functionName) {
  if (typeof driver[functionName] !== 'function') {
    throw new Error(`${driver.id} missing ${functionName} implementation`);
  }
}

/**
 * Validate that the driver implementation has an array by name provided
 * @param {object} driver
 * @param {string} arrayName
 */
function validateArray(driver, arrayName) {
  const arr = driver[arrayName];
  if (!Array.isArray(arr)) {
    throw new Error(`${driver.id} missing ${arrayName} array`);
  }
}

/**
 * Validate driver implementation
 * @param {string} id
 * @param {object} driver
 */
function validate(id, driver) {
  if (!driver.id) {
    throw new Error(`${id} must export a unique id`);
  }

  if (id !== driver.id) {
    throw new Error(`${id} does not match driver id ${driver.id}`);
  }

  if (!driver.name) {
    throw new Error(`${id} must export a name`);
  }

  validateFunction(driver, 'getSchema');
  validateFunction(driver, 'runQuery');
  validateFunction(driver, 'testConnection');
  validateArray(driver, 'fields');
}

module.exports = validate;
