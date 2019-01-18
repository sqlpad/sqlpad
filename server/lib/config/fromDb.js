const definitions = require('./configItems')

const uiKeys = definitions
  .filter(definition => definition.interface === 'ui')
  .map(definition => definition.key)

/**
 * Gets config values set in ui from db
 * @param {object} db
 * @returns {Promise} configMap as a Promise
 */
module.exports = function getUiConfig(db) {
  if (!db) {
    return Promise.reject(new Error('db not provided'))
  }
  return db.config.find({}).then(docs => {
    if (!docs || !docs.length) {
      return {}
    }
    const configMap = {}
    docs
      .filter(doc => uiKeys.includes(doc.key))
      .forEach(doc => {
        configMap[doc.key] = doc.value
      })
    return configMap
  })
}
