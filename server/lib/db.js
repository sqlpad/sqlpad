const path = require('path')
const Datastore = require('nedb')
const mkdirp = require('mkdirp')
const async = require('async')
const { admin, dbPath, debug, port } = require('./config').getPreDbConfig()
const migrateSchema = require('./migrate-schema.js')

mkdirp.sync(path.join(dbPath, '/cache'))

let loaded = false
let loadError = null
const onLoads = []

const db = {
  users: new Datastore({ filename: path.join(dbPath, 'users.db') }),
  connections: new Datastore({
    filename: path.join(dbPath, 'connections.db')
  }),
  queries: new Datastore({ filename: path.join(dbPath, 'queries.db') }),
  cache: new Datastore({ filename: path.join(dbPath, 'cache.db') }),
  config: new Datastore({ filename: path.join(dbPath, 'config.db') }),
  instances: ['users', 'connections', 'queries', 'cache', 'config'],
  onLoad: function(fn) {
    if (loaded) {
      return fn(loadError)
    }
    onLoads.push(fn)
  }
}

module.exports = db

// Load dbs, migrate data, and apply indexes
async.series(
  [
    function load(next) {
      async.eachSeries(
        db.instances,
        function(dbname, next) {
          if (debug) {
            console.log('Loading %s..', dbname)
          }
          db[dbname].loadDatabase(next)
        },
        next
      )
    },
    function migrate(next) {
      migrateSchema(db)
        .then(next)
        .catch(next)
    },
    function index(next) {
      db.users.ensureIndex({ fieldName: 'email', unique: true }, next)
    },
    function index(next) {
      db.cache.ensureIndex({ fieldName: 'cacheKey', unique: true }, next)
    },
    function index(next) {
      db.config.ensureIndex({ fieldName: 'key', unique: true }, next)
    },
    ensureAdmin,
    setAutocompaction
  ],
  function finishedLoading(err) {
    loaded = true
    loadError = err
    onLoads.forEach(fn => fn(err))
  }
)

function ensureAdmin(next) {
  const adminEmail = admin
  if (!adminEmail) return next()

  // if an admin was passed in the command line, check to see if a user exists with that email
  // if so, set the admin to true
  // if not, whitelist the email address.
  // Then write to console that the person should visit the signup url to finish registration.
  db.users.findOne({ email: adminEmail }, function(err, user) {
    if (err) return next(err)

    if (user) {
      db.users.update(
        { _id: user._id },
        { $set: { role: 'admin' } },
        {},
        function(err) {
          if (err) {
            console.log('ERROR: could not make ' + adminEmail + ' an admin.')
            next(err)
          } else {
            console.log(adminEmail + ' should now have admin access.')
            next()
          }
        }
      )
    } else {
      var newAdmin = {
        email: adminEmail,
        role: 'admin'
      }
      db.users.insert(newAdmin, function(err) {
        if (err) {
          console.log('\n/ERROR: could not make ' + adminEmail + ' an admin.')
          next(err)
        } else {
          console.log(
            '\n' + adminEmail + ' has been whitelisted with admin access.'
          )
          console.log(
            '\nPlease visit http://localhost:' +
              port +
              '/signup/ to complete registration.'
          )
          next()
        }
      })
    }
  })
}

// Every so often compact the NeDB files
function setAutocompaction(next) {
  var tenMinutes = 1000 * 60 * 10

  db.instances.forEach(function(dbname) {
    db[dbname].persistence.setAutocompactionInterval(tenMinutes)
  })

  next()
}
