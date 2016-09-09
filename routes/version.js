var router = require('express').Router()
var packageJson = require('../package.json')
const latestVersion = require('latest-version')
var semverDiff = require('semver-diff')
const ONE_DAY = 1000 * 60 * 60 * 24

var version = {
  updateAvailable: false,
  updateType: null,
  current: packageJson.version,
  latest: null
}

function checkForUpdate () {
  latestVersion(packageJson.name).then(npmVersion => {
    version.latest = npmVersion
    var difference = semverDiff(version.current, npmVersion)
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

setInterval(checkForUpdate, ONE_DAY)
setTimeout(checkForUpdate, 1000)

router.get('/api/version', function (req, res) {
  return res.json({
    version: version
  })
})

module.exports = router
