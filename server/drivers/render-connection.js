const _ = require('lodash');

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
  Object.keys(connection).forEach(key => {
    const value = connection[key];
    if (typeof value === 'string') {
      _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
      const compiled = _.template(value);
      replaced[key] = compiled({ user });
    } else {
      replaced[key] = value;
    }
  });
  return replaced;
}

module.exports = renderConnection;
