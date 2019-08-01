const packageJson = require('../package.json');
const latestVersion = require('latest-version');
const semverDiff = require('semver-diff');
const config = require('./config');

const ONE_DAY = 1000 * 60 * 60 * 24;

const version = {
  updateAvailable: false,
  updateType: null,
  current: packageJson.version,
  latest: null
};

function logUpdateAvailable(version) {
  console.log(`
  ===================================================================
  Update available (${version.updateType})
  Current version: ${version.current}
  Latest  version: ${version.latest}

  run npm i -g ${packageJson.name} to update
  ===================================================================
  `);
}

async function checkForUpdate() {
  try {
    if (config.get('disableUpdateCheck')) {
      return;
    }
    const npmVersion = await latestVersion(packageJson.name);
    version.latest = npmVersion;
    const difference = semverDiff(version.current, npmVersion);
    if (difference) {
      version.updateAvailable = true;
      version.updateType = difference;
      logUpdateAvailable(version);
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  get() {
    return Object.assign({}, version);
  },
  scheduleUpdateChecks() {
    setInterval(checkForUpdate, ONE_DAY);
    setTimeout(checkForUpdate, 5000);
  }
};
