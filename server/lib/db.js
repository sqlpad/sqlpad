const path = require('path');
const datastore = require('nedb-promise');
const mkdirp = require('mkdirp');
const { admin, dbPath, debug, port } = require('./config').getPreDbConfig();

mkdirp.sync(path.join(dbPath, '/cache'));

const db = {
  users: datastore({ filename: path.join(dbPath, 'users.db') }),
  connections: datastore({
    filename: path.join(dbPath, 'connections.db')
  }),
  queries: datastore({ filename: path.join(dbPath, 'queries.db') }),
  cache: datastore({ filename: path.join(dbPath, 'cache.db') }),
  instances: ['users', 'connections', 'queries', 'cache']
};

// Load dbs, migrate data, and apply indexes
async function init() {
  await Promise.all(
    db.instances.map(dbname => {
      if (debug) {
        console.log('Loading %s..', dbname);
      }
      return db[dbname].loadDatabase();
    })
  );
  await db.users.ensureIndex({ fieldName: 'email', unique: true });
  await db.cache.ensureIndex({ fieldName: 'cacheKey', unique: true });
  // set autocompaction
  const tenMinutes = 1000 * 60 * 10;
  db.instances.forEach(dbname => {
    db[dbname].nedb.persistence.setAutocompactionInterval(tenMinutes);
  });
  return ensureAdmin();
}

db.loadPromise = init();

async function ensureAdmin() {
  const adminEmail = admin;
  if (!adminEmail) {
    return;
  }

  try {
    // if an admin was passed in the command line, check to see if a user exists with that email
    // if so, set the admin to true
    // if not, whitelist the email address.
    // Then write to console that the person should visit the signup url to finish registration.
    const user = await db.users.findOne({ email: adminEmail });
    if (user) {
      await db.users.update({ _id: user._id }, { $set: { role: 'admin' } }, {});
      console.log(adminEmail + ' should now have admin access.');
      return;
    }

    const newAdmin = {
      email: adminEmail,
      role: 'admin'
    };
    await db.users.insert(newAdmin);
    console.log(`\n${adminEmail} has been whitelisted with admin access.`);
    console.log(
      `\nPlease visit http://localhost:${port}/signup/ to complete registration.`
    );
  } catch (error) {
    console.log(`ERROR: could not make ${adminEmail} an admin.`);
    throw error;
  }
}

module.exports = db;
