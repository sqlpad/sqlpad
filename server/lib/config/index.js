const nonUi = require('./nonUi')
const ui = require('./ui')

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
