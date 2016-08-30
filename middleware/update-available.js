var packageJson = require('../package.json');
const latestVersion = require('latest-version');
var semverDiff = require('semver-diff');
const ONE_DAY = 1000 * 60 * 60 * 24;
var updateAvailable = false;
var updateType = null;
var latestNpmVersion = null;

function checkForUpdate () {    
    latestVersion(packageJson.name).then(npmVersion => {
        latestNpmVersion = npmVersion;
        var difference = semverDiff(packageJson.version, npmVersion);
        if (difference) {
            updateAvailable = true;
            updateType = difference;
            console.log("\n" + "=".repeat(70))
            console.log("update available (%s)", updateType);
            console.log("current version: %s      latest: %s", packageJson.version, npmVersion);
            console.log("run 'npm i -g " + packageJson.name + "' to update.");
            console.log("=".repeat(70) + "\n")
        }
    });
}

module.exports = function checkForUpdateMiddleware (req, res, next) {
    res.locals.updateAvailable = updateAvailable;
    res.locals.updateType = updateType;
    res.locals.currentVersion = packageJson.version;
    res.locals.latestVersion = latestNpmVersion;
    next();
}

setInterval(checkForUpdate, ONE_DAY);
setTimeout(checkForUpdate, 1000);