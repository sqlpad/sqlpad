var path = require('path')
var Datastore = require('nedb')
var ConfigItem = require('../models/ConfigItem.js')
var config = require('./config.js')
var mkdirp = require('mkdirp')
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

var db = {
  users: new Datastore({filename: path.join(DB_PATH, '/users.db'), autoload: true, onload: onLoadFunction('users')}),
  connections: new Datastore({filename: path.join(DB_PATH, '/connections.db'), autoload: true, onload: onLoadFunction('connections')}),
  queries: new Datastore({filename: path.join(DB_PATH, '/queries.db'), autoload: true, onload: onLoadFunction('queries')}),
  cache: new Datastore({filename: path.join(DB_PATH, '/cache.db'), autoload: true, onload: onLoadFunction('cache')}),
  config: new Datastore({filename: path.join(DB_PATH, '/config.db'), autoload: true, onload: onLoadFunction('config')}),
  loadedDbs: [],
  instances: [
    'users',
    'connections',
    'queries',
    'cache',
    'config'
  ]
}
module.exports = db

function onLoadFunction (dbname) {
  return function (err) {
    if (err) {
      console.error('Error loading ' + dbname)
      console.error(err)
    }
    db.loadedDbs.push(dbname)
    if (DEBUG) console.log('database loaded: ' + dbname + ' (%d/%d)', db.loadedDbs.length, db.instances.length)
    if (db.loadedDbs.length === db.instances.length) {
      onAllDatabasesLoaded()
    }
    switch (dbname) {
      case 'users':
        db.users.ensureIndex({fieldName: 'email', unique: true}, function (err) {
          if (err) console.log(err)
          ensureAdmin()
        })
        break
      case 'cache':
        db.cache.ensureIndex({fieldName: 'cacheKey', unique: true}, function (err) {
          if (err) console.log(err)
        })
        break
      case 'config':
        db.config.ensureIndex({fieldName: 'key', unique: true}, function (err) {
          if (err) console.log(err)
          setConfigDbValues()
        })
        break
    }
  }
}

function onAllDatabasesLoaded () {
  if (DEBUG) console.log('all databases loaded.')
    // NOTE since this depends on db.js we require during function call and NOT at top
  var migrateSchema = require('./migrate-schema.js')
  migrateSchema(function (err) {
    if (err) {
      console.error('Error running migrations')
      console.error(err)
    }
    if (DEBUG) console.log('schema up to date.')
  })
}

// loop through items in the config nedb and set the dbValue cache
function setConfigDbValues () {
  db.config.find({}).exec(function (err, dbItems) {
    if (err) console.log('error getting database config items')
    dbItems.forEach(function (item) {
      var configItem = ConfigItem.findOneByKey(item.key)
      if (configItem) configItem.setDbValue(item.value)
    })
  })
}

function ensureAdmin () {
    // if an admin was passed in the command line, check to see if a user exists with that email
    // if so, set the admin to true
    // if not, whitelist the email address.
    // Then write to console that the person should visit the signup url to finish registration.
  if (config.get('admin')) {
    var adminEmail = config.get('admin')
    db.users.findOne({email: adminEmail}, function (err, user) {
      if (err) {
        console.error(err)
      }
      if (user) {
        db.users.update({_id: user._id}, {$set: {role: 'admin'}}, {}, function (err) {
          if (err) {
            console.log('ERROR: could not make ' + adminEmail + ' an admin.')
          } else {
            console.log(adminEmail + ' should now have admin access.')
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
          } else {
            console.log('\n' + adminEmail + ' has been whitelisted with admin access.')
            console.log('\nPlease visit http://localhost:' + config.get('port') + '/signup/ to complete registration.')
          }
        })
      }
    })
  }
}

/*  Every so often compact the NeDB files
========================================================================= */
var tenMinutes = 1000 * 60 * 10
db.instances.forEach(function (dbname) {
  db[dbname].persistence.setAutocompactionInterval(tenMinutes)
})
