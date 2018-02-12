// TODO This is a shell of an old pattern that can be abandoned
const configUtil = require('../lib/config')
const { cliConfig, savedCliConfig, envConfig } = require('../lib/config/nonUi')
const db = require('../lib/db')

const configDefinitions = require('../resources/configItems')

exports.save = function(key, value) {
  return new Promise((resolve, reject) => {
    const definition = configDefinitions.find(
      definition => definition.key === key
    )

    if (definition.interface !== 'ui') {
      return reject(
        new Error(
          'Config Item ' + this.key + ' must use ui interface to be saved to db'
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

exports.findAll = function() {
  return configUtil.getHelper(db).then(config => {
    return configDefinitions.map(definition => {
      return Object.assign({}, definition, {
        effectiveValue: config.get(definition.key),
        envValue: envConfig[definition.key],
        cliValue: cliConfig[definition.key],
        savedCliValue: savedCliConfig[definition.key],
        // TODO
        dbValue: null
      })
    })
  })
}
