const definitions = require('./configItems');

const uiKeys = definitions
  .filter(definition => definition.interface === 'ui')
  .map(definition => definition.key);

/**
 * Gets config values set in ui from db
 * @param {object} db
 * @returns {Promise} configMap as a Promise
 */
module.exports = async function getUiConfig(db) {
  if (!db) {
    throw new Error('db not provided');
  }
  const docs = await db.config.find({});
  if (!docs || !docs.length) {
    return {};
  }
  const configMap = {};
  docs
    .filter(doc => uiKeys.includes(doc.key))
    .forEach(doc => {
      configMap[doc.key] = doc.value;
    });
  return configMap;
};
