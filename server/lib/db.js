const path = require('path');
const datastore = require('nedb-promise');
const mkdirp = require('mkdirp');
const logger = require('./logger');
const config = require('./config');
const consts = require('./consts');
const passhash = require('../lib/passhash');

const admin = config.get('admin');
const adminPassword = config.get('adminPassword');
const dbPath = config.get('dbPath');
const allowConnectionAccessToEveryone = config.get(
  'allowConnectionAccessToEveryone'
);

mkdirp.sync(path.join(dbPath, '/cache'));

const db = {
  users: datastore({ filename: path.join(dbPath, 'users.db') }),
  connections: datastore({
    filename: path.join(dbPath, 'connections.db')
  }),
  connectionAccesses: datastore({
    filename: path.join(dbPath, 'connectionaccesses.db')
  }),
  queries: datastore({ filename: path.join(dbPath, 'queries.db') }),
  queryHistory: datastore({ filename: path.join(dbPath, 'queryhistory.db') }),
  cache: datastore({ filename: path.join(dbPath, 'cache.db') }),
  instances: [
    'users',
    'connections',
    'connectionAccesses',
    'queries',
    'queryHistory',
    'cache'
  ]
};

// Load dbs, migrate data, and apply indexes
async function init() {
  await Promise.all(
    db.instances.map(dbname => {
      logger.info('Loading %s', dbname);
      return db[dbname].loadDatabase();
    })
  );
  // create default connection accesses
  if (allowConnectionAccessToEveryone) {
    logger.info('Creating access on every connection to every user...');
    await db.connectionAccesses.update(
      {
        connectionId: consts.EVERY_CONNECTION_ID,
        userId: consts.EVERYONE_ID
      },
      {
        connectionId: consts.EVERY_CONNECTION_ID,
        connectionName: consts.EVERY_CONNECTION_NAME,
        userId: consts.EVERYONE_ID,
        userEmail: consts.EVERYONE_EMAIL,
        duration: 0,
        expiryDate: new Date(new Date().setFullYear(2099))
      },
      {
        upsert: true
      }
    );
  }
  // Apply indexes
  await db.users.ensureIndex({ fieldName: 'email', unique: true });
  await db.cache.ensureIndex({ fieldName: 'cacheKey', unique: true });
  await db.connectionAccesses.ensureIndex({ fieldName: 'connectionId' });
  await db.connectionAccesses.ensureIndex({ fieldName: 'userId' });
  await db.queryHistory.ensureIndex({ fieldName: 'connectionName' });
  await db.queryHistory.ensureIndex({ fieldName: 'userEmail' });
  await db.queryHistory.ensureIndex({ fieldName: 'createdDate' });
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
    // Then log that the person should visit the signup url to finish registration.
    const user = await db.users.findOne({ email: adminEmail });
    if (user) {
      const changes = { role: 'admin' };
      if (adminPassword) {
        changes.passhash = await passhash.getPasshash(adminPassword);
      }
      await db.users.update({ _id: user._id }, { $set: changes }, {});
      logger.info('Admin access granted to %s', adminEmail);
      return;
    }

    const newAdmin = {
      email: adminEmail,
      role: 'admin'
    };
    if (adminPassword) {
      newAdmin.passhash = await passhash.getPasshash(adminPassword);
    }
    await db.users.insert(newAdmin);
    logger.info('Admin access granted to %s', adminEmail);
    logger.info('Please visit signup to complete registration.');
  } catch (error) {
    logger.error('Admin access grant failed for %s', adminEmail);
    throw error;
  }
}

module.exports = db;
