const mustache = require('mustache');

// Disable HTML escaping. We're not using it for HTML
mustache.escape = function (text) {
  return text;
};

/**
 * Iterates over connection object, replacing any template strings with values from user
 * This allows dynamic values inserted based on logged in user
 * This uses a mustache-like syntax, using double mustaches.
 * User variables can be referenced in connection strings using dot notation
 * Example: {{user.someKey}} and {{user.data.someKey}}
 * @param {object} connection
 * @param {object} user
 */
function renderConnection(connection, user) {
  const replaced = {};
  Object.keys(connection).forEach((key) => {
    // data is an object of values, but values may be top level too
    if (key === 'data') {
      const value = renderConnection(connection.data, user);
      connection.data = value;
    } else {
      const value = connection[key];
      if (typeof value === 'string') {
        replaced[key] = mustache.render(value, { user });
      } else {
        replaced[key] = value;
      }
    }
  });
  return replaced;
}

module.exports = renderConnection;
