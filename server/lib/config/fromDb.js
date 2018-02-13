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
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject(new Error('db not provided'))
    }
    db.config.find({}, function(err, docs) {
      if (err) {
        return reject(err)
      }
      if (!docs || !docs.length) {
        return resolve({})
      }
      const configMap = {}
      docs.filter(doc => uiKeys.includes(doc.key)).forEach(doc => {
        configMap[doc.key] = doc.value
      })
      return resolve(configMap)
    })
  })
}
