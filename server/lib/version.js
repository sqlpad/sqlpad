const packageJson = require('../package.json')
const latestVersion = require('latest-version')
const semverDiff = require('semver-diff')
const db = require('./db.js')
const configUtil = require('./config')

const ONE_DAY = 1000 * 60 * 60 * 24

const version = {
  updateAvailable: false,
  updateType: null,
  current: packageJson.version,
  latest: null
}

function logUpdateAvailable(version) {
  console.log(`
  ===================================================================
  Update available (${version.updateType})
  Current version: ${version.current}
  Latest  version: ${version.latest}

  run npm i -g ${packageJson.name} to update
  ===================================================================
  `)
}

function checkForUpdate() {
  return configUtil
    .getHelper(db)
    .then(config => {
      if (config.get('disableUpdateCheck')) {
        return
      }
      return latestVersion(packageJson.name).then(npmVersion => {
        version.latest = npmVersion
        const difference = semverDiff(version.current, npmVersion)
        if (difference) {
          version.updateAvailable = true
          version.updateType = difference
          logUpdateAvailable(version)
        }
      })
    })
    .catch(error => {
      console.log(error)
    })
}

module.exports = {
  get: function() {
    return Object.assign({}, version)
  },
  scheduleUpdateChecks: function() {
    setInterval(checkForUpdate, ONE_DAY)
    setTimeout(checkForUpdate, 5000)
  }
}
