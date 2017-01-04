var fs = require('fs')
var path = require('path')
var async = require('async')
var config = require('./config.js')
var db = require('./db.js')
var Cache = require('../models/Cache.js')
const DB_PATH = config.get('dbPath')
const DEBUG = config.get('debug')
var schemaVersionFilePath = path.join(DB_PATH + '/schemaVersion.json')

// migrations must increment by 1
var migrations = {
  1: function (done) {
    // from now on, user.createdDate is when the user record was createdDate
    // instead of when the user signed up
    // user.signupDate should be used when user is initially signed up.
    // NOTE: using db directly here to avoid model schema conflicts
    // and extra model logic (like modified date updates)
    db.users.find({}).exec(function (err, docs) {
      if (err) return done(err)
      async.eachSeries(docs, function (doc, callback) {
        doc.signupDate = doc.createdDate
        doc.createdDate = doc.createdDate || new Date()
        doc.modifiedDate = doc.modifiedDate || new Date()
        db.users.update({_id: doc._id}, doc, {}, callback)
      }, done)
    })
  },
  2: function (done) {
    // reset cache because it wasn't being cleaned up properly before
    Cache.removeAll(done)
  },
  3: function (done) {
    // change admin flag to role to allow for future viewer role
    // NOTE: using db directly here to avoid model schema conflicts
    // and extra model logic (like modified date updates)
    db.users.find({}).exec(function (err, docs) {
      if (err) return done(err)
      async.eachSeries(docs, function (doc, callback) {
        if (doc.admin) {
          doc.role = 'admin'
        } else {
          doc.role = 'editor'
        }
        db.users.update({_id: doc._id}, doc, {}, callback)
      }, done)
    })
  }
}

function runMigrations (currentVersion, callback) {
  var nextVersion = currentVersion + 1
  if (migrations[nextVersion]) {
    if (DEBUG) console.log('Migrating schema to v%d', nextVersion)
    migrations[nextVersion](function (err) {
      if (err) return callback(err)

      // write new schemaVersion file
      var json = JSON.stringify({schemaVersion: nextVersion})
      fs.writeFile(schemaVersionFilePath, json, function (err) {
        if (err) return callback(err)
        runMigrations(nextVersion, callback)
      })
    })
  } else {
    callback()
  }
}

module.exports = function migrateSchema (callback) {
  fs.readFile(schemaVersionFilePath, 'utf8', function (err, json) {
    if (err && err.code !== 'ENOENT') return callback(err)

    var currentVersion = json ? JSON.parse(json).schemaVersion : 0
    var latestVersion = Object.keys(migrations).reduce(function(prev, next) {
      return Math.max(prev, next)
    })

    if (currentVersion === latestVersion) {
      if (DEBUG) console.log('Schema is up to date (v%d).', latestVersion)
      return callback()
    }

    runMigrations(currentVersion, callback)
  })
}
