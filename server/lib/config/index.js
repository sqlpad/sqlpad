const nonUi = require('./nonUi')
const ui = require('./ui')
const definitions = require('../../resources/configItems')

function makeSave(db) {
  return function save(key, value) {
    return new Promise((resolve, reject) => {
      const definition = definitions.find(definition => definition.key === key)

      if (definition.interface !== 'ui') {
        return reject(
          new Error(
            'Config Item ' +
              this.key +
              ' must use ui interface to be saved to db'
          )
        )
      }

      db.config.findOne({ key }).exec(function(err, doc) {
        if (err) {
          return reject(err)
        }
        if (doc) {
          doc.value = value
          doc.modifiedDate = new Date()
          db.config.update({ _id: doc._id }, doc, {}, function(err) {
            if (err) {
              return reject(err)
            }
            return resolve(null, doc)
          })
        } else {
          const newConfigValue = {
            key,
            value,
            createdDate: new Date(),
            modifiedDate: new Date()
          }
          db.config.insert(newConfigValue, function(err) {
            if (err) {
              return reject(err)
            }
            return resolve(null, newConfigValue)
          })
        }
      })
    })
  }
}

/**
 * Gets config helper using all config sources
 * @param {db} db
 * @returns {Promise} configHelper
 */
exports.getHelper = function getAllConfig(db) {
  const { defaultConfig, envConfig, savedCliConfig, cliConfig } = nonUi
  return ui(db).then(uiConfig => {
    const all = Object.assign(
      {},
      defaultConfig,
      uiConfig,
      envConfig,
      savedCliConfig,
      cliConfig
    )

    const configHelper = {
      get: key => {
        if (!all.hasOwnProperty(key)) {
          throw new Error(`config item ${key} not defined in configItems.js`)
        }
        return all[key]
      },
      getItems: () => {
        return definitions.map(definition => {
          return Object.assign({}, definition, {
            effectiveValue: all[definition.key],
            envValue: envConfig[definition.key],
            cliValue: cliConfig[definition.key],
            savedCliValue: savedCliConfig[definition.key],
            dbValue: uiConfig[definition.key]
          })
        })
      },
      save: makeSave(db),
      smtpConfigured: () =>
        all.smtpHost &&
        all.smtpUser &&
        all.smtpFrom &&
        all.smtpPort &&
        all.publicUrl,
      googleAuthConfigured: () =>
        all.publicUrl && all.googleClientId && all.googleClientSecret
    }

    return configHelper
  })
}
