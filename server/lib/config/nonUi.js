const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const getDefault = require('./default')
const getEnv = require('./env')
const getCli = require('./cli')

// argv
const argv = minimist(process.argv.slice(2))

// Saved argv
const userHome =
  process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME
const filePath = path.join(userHome, '.sqlpadrc')
const savedArgv = fs.existsSync(filePath)
  ? JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }))
  : {}

const defaultConfig = getDefault()
const cliConfig = getCli(argv)
const savedCliConfig = getCli(savedArgv)
const envConfig = getEnv()

/**
 * Get all config item values sans values from UI/db
 * @returns {object} configMap
 */
exports.getConfig = function getConfig() {
  return Object.assign({}, defaultConfig, envConfig, savedCliConfig, cliConfig)
}

exports.defaultConfig = defaultConfig
exports.cliConfig = cliConfig
exports.savedCliConfig = savedCliConfig
exports.envConfig = envConfig
