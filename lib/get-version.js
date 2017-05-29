const packageJson = require('../package.json')
const latestVersion = require('latest-version')
const semverDiff = require('semver-diff')
const _ = require('lodash')
const config = require('./config.js')
const ONE_DAY = 1000 * 60 * 60 * 24

const version = {
  updateAvailable: false,
  updateType: null,
  current: packageJson.version,
  latest: null
}

function checkForUpdate () {
  if (!config.get('disableUpdateCheck')) {
    latestVersion(packageJson.name).then(npmVersion => {
      version.latest = npmVersion
      const difference = semverDiff(version.current, npmVersion)
      if (difference) {
        version.updateAvailable = true
        version.updateType = difference
        console.log('\n' + '='.repeat(70))
        console.log('update available (%s)', version.updateType)
        console.log('current version: %s      latest: %s', version.curent, version.latest)
        console.log("run 'npm i -g " + packageJson.name + "' to update.")
        console.log('='.repeat(70) + '\n')
      }
    })
  }
}

setInterval(checkForUpdate, ONE_DAY)
setTimeout(checkForUpdate, 5000)

module.exports = function () {
  return _.clone(version)
}
