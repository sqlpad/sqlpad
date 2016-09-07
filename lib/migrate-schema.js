var fs = require('fs')
var path = require('path')
var async = require('async')
var config = require('./config.js')
var User = require('../models/User.js')
var Cache = require('../models/Cache.js')

const DB_PATH = config.get('dbPath')
const DEBUG = config.get('debug')
var schemaVersionFilePath = path.join(DB_PATH + '/schemaVersion.json')

// if schemaversion file does not exist
// create it and set it to version 0
try {
  fs.accessSync(schemaVersionFilePath)
} catch (e) {
  if (DEBUG) console.log('creating schemaVersion file: ' + schemaVersionFilePath)
  fs.writeFileSync(schemaVersionFilePath, JSON.stringify({schemaVersion: 0}))
}

// migrations must increment by 1
var migrations = {
  // from now on, user.createdDate is when the user record was createdDate
  // instead of when the user signed up
  // user.signupDate should be used when user is initially signed up.
  1: function (done) {
    User.findAll(function (err, users) {
      if (err) return done(err)
      async.eachSeries(users, function (user, callback) {
        user.signupDate = user.createdDate
        user.save(callback)
      }, done)
    })
  },
  // reset cache because it wasn't being cleaned up properly before
  2: function (done) {
    Cache.removeAll(done)
  }
}

function runMigrations (currentVersion, callback) {
  var nextVersion = currentVersion + 1
  if (migrations[nextVersion]) {
    if (DEBUG) console.log('Migrating schema from %d to %d', currentVersion, nextVersion)
    migrations[nextVersion](function (err) {
      // if error log it and stop running migrations
      if (err) {
        console.error('Error running migration for %d', nextVersion)
        console.error(err)
        return callback(err)
      }
      // write new schemaVersion file
      fs.writeFileSync(schemaVersionFilePath, JSON.stringify({schemaVersion: nextVersion}))
      runMigrations(nextVersion, callback)
    })
  } else {
    callback()
  }
}

module.exports = function migrateSchema (callback) {
  var schemaVersion = JSON.parse(fs.readFileSync(schemaVersionFilePath, {encoding: 'utf8'}))
  runMigrations(schemaVersion.schemaVersion, callback)
}
