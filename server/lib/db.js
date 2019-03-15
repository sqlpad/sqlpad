const path = require('path');
const datastore = require('nedb-promise');
const mkdirp = require('mkdirp');
const { admin, dbPath, debug, port } = require('./config').getPreDbConfig();
const migrateSchema = require('./migrate-schema.js');

mkdirp.sync(path.join(dbPath, '/cache'));

// TODO return db as a Promise
let loaded = false;
let loadError = null;
const onLoads = [];

const db = {
  users: datastore({ filename: path.join(dbPath, 'users.db') }),
  connections: datastore({
    filename: path.join(dbPath, 'connections.db')
  }),
  queries: datastore({ filename: path.join(dbPath, 'queries.db') }),
  cache: datastore({ filename: path.join(dbPath, 'cache.db') }),
  config: datastore({ filename: path.join(dbPath, 'config.db') }),
  instances: ['users', 'connections', 'queries', 'cache', 'config'],
  onLoad(fn) {
    if (loaded) {
      return fn(loadError);
    }
    onLoads.push(fn);
  }
};

module.exports = db;

// Load dbs, migrate data, and apply indexes
Promise.resolve()
  .then(() => {
    const loadTasks = db.instances.map(dbname => {
      if (debug) {
        console.log('Loading %s..', dbname);
      }
      return db[dbname].loadDatabase();
    });
    return Promise.all(loadTasks);
  })
  .then(() => migrateSchema(db))
  .then(() => db.users.ensureIndex({ fieldName: 'email', unique: true }))
  .then(() => db.cache.ensureIndex({ fieldName: 'cacheKey', unique: true }))
  .then(() => db.config.ensureIndex({ fieldName: 'key', unique: true }))
  .then(() => {
    // set autocompaction
    const tenMinutes = 1000 * 60 * 10;
    db.instances.forEach(function(dbname) {
      db[dbname].nedb.persistence.setAutocompactionInterval(tenMinutes);
    });
    return ensureAdmin();
  })
  .then(() => {
    loaded = true;
    onLoads.forEach(fn => fn());
  })
  .catch(error => {
    onLoads.forEach(fn => fn(error));
  });

function ensureAdmin() {
  const adminEmail = admin;
  if (!adminEmail) {
    return Promise.resolve();
  }

  // if an admin was passed in the command line, check to see if a user exists with that email
  // if so, set the admin to true
  // if not, whitelist the email address.
  // Then write to console that the person should visit the signup url to finish registration.
  return db.users.findOne({ email: adminEmail }).then(user => {
    if (user) {
      return db.users
        .update({ _id: user._id }, { $set: { role: 'admin' } }, {})
        .then(() => {
          console.log(adminEmail + ' should now have admin access.');
        })
        .catch(error => {
          console.log('ERROR: could not make ' + adminEmail + ' an admin.');
          throw error;
        });
    }
    const newAdmin = {
      email: adminEmail,
      role: 'admin'
    };
    return db.users
      .insert(newAdmin)
      .then(() => {
        console.log(
          '\n' + adminEmail + ' has been whitelisted with admin access.'
        );
        console.log(
          '\nPlease visit http://localhost:' +
            port +
            '/signup/ to complete registration.'
        );
      })
      .catch(error => {
        console.log('\n/ERROR: could not make ' + adminEmail + ' an admin.');
        throw error;
      });
  });
}
