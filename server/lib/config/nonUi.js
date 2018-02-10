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

const defaultConf = getDefault()
const cliConf = getCli(argv)
const savedCliConf = getCli(savedArgv)
const envConf = getEnv()

module.exports = Object.assign({}, defaultConf, envConf, savedCliConf, cliConf)
