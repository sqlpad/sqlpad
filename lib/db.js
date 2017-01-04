var path = require('path')
var Datastore = require('nedb')
var ConfigItem = require('../models/ConfigItem.js')
var config = require('./config.js')
var mkdirp = require('mkdirp')
var async = require('async')
const DB_PATH = config.get('dbPath')
const DEBUG = config.get('debug')

mkdirp.sync(path.join(DB_PATH, '/cache'))

/*
    Usage:

    db.js provides link to initialized nedb instance

    var db = require('db.js');

    // reference an nedb instance like users:
    db.users

============================================================================== */

var db = module.exports = {
  users: new Datastore({filename: path.join(DB_PATH, 'users.db')}),
  connections: new Datastore({filename: path.join(DB_PATH, 'connections.db')}),
  queries: new Datastore({filename: path.join(DB_PATH, 'queries.db')}),
  cache: new Datastore({filename: path.join(DB_PATH, 'cache.db')}),
  config: new Datastore({filename: path.join(DB_PATH, 'config.db')}),
  instances: [
    'users',
    'connections',
    'queries',
    'cache',
    'config'
  ],
  load: function (done) {
    async.series([
      function load (next) {
        async.eachSeries(db.instances, function (dbname, next) {
          if (DEBUG) console.log('Loading %s..', dbname)
          db[dbname].loadDatabase(next)
        }, next)
      },
      function migrate (next) {
        // NOTE since this depends on db.js we require during function call and NOT at top
        require('./migrate-schema.js')(next)
      },
      function index (next) {
        db.users.ensureIndex({fieldName: 'email', unique: true}, next)
      },
      function index (next) {
        db.cache.ensureIndex({fieldName: 'cacheKey', unique: true}, next)
      },
      function index (next) {
        db.config.ensureIndex({fieldName: 'key', unique: true}, next)
      },
      setConfigDbValues,
      ensureAdmin,
      setAutocompaction
    ], done)
  }
}

// loop through items in the config nedb and set the dbValue cache
function setConfigDbValues (next) {
  db.config.find({}, function (err, dbItems) {
    if (err) return next(err)
    dbItems.forEach(function (item) {
      var configItem = ConfigItem.findOneByKey(item.key)
      if (configItem) configItem.setDbValue(item.value)
    })
    next()
  })
}

function ensureAdmin (next) {
  var adminEmail = config.get('admin')
  if (!adminEmail) return next()

  // if an admin was passed in the command line, check to see if a user exists with that email
  // if so, set the admin to true
  // if not, whitelist the email address.
  // Then write to console that the person should visit the signup url to finish registration.
  db.users.findOne({email: adminEmail}, function (err, user) {
    if (err) return next(err)

    if (user) {
      db.users.update({_id: user._id}, {$set: {role: 'admin'}}, {}, function (err) {
        if (err) {
          console.log('ERROR: could not make ' + adminEmail + ' an admin.')
          next(err)
        } else {
          console.log(adminEmail + ' should now have admin access.')
          next()
        }
      })
    } else {
      var newAdmin = {
        email: adminEmail,
        role: 'admin'
      }
      db.users.insert(newAdmin, function (err) {
        if (err) {
          console.log('\n/ERROR: could not make ' + adminEmail + ' an admin.')
          next(err)
        } else {
          console.log('\n' + adminEmail + ' has been whitelisted with admin access.')
          console.log('\nPlease visit http://localhost:' + config.get('port') + '/signup/ to complete registration.')
          next()
        }
      })
    }
  })
}

// Every so often compact the NeDB files
function setAutocompaction (next) {
  var tenMinutes = 1000 * 60 * 10

  db.instances.forEach(function (dbname) {
    db[dbname].persistence.setAutocompactionInterval(tenMinutes)
  })

  next()
}
