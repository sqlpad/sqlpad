const nonUi = require('./nonUi')
const ui = require('./ui')

/**
 * Gets config from all sources, and returns config helper with getters
 * @param {db} db
 * @returns {Promise} configHelper
 */
module.exports = function getAllConfig(db) {
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
