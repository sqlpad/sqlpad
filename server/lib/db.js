const path = require('path');
const datastore = require('nedb-promise');
const mkdirp = require('mkdirp');
const logger = require('./logger');
const ensureAdmin = require('./ensureAdmin');
const consts = require('./consts');
const getModels = require('../models');

const TEN_MINUTES = 1000 * 60 * 10;
const FIVE_MINUTES = 1000 * 60 * 5;

/**
 * Whenever possible nedb should be read from the app req object.
 * Sometimes this isn't possible or convenient at the moment however.
 * For those cases, this module provides access by caching the nedb instance.
 * Safety measures have been added to ensure only 1 instance of nedb can be initialized per alias
 */
let instances = {};

/**
 * Get nedb instance for an optional alias.
 * Returns promise of nedb instance
 * @param {string} [instanceAlias]
 */
function getNedb(instanceAlias = 'default') {
  const nedb = instances[instanceAlias];
  if (!nedb) {
    throw new Error('nedb instance must be created first');
  }
  // nedb will already be a promise -- this just makes it explicit
  return Promise.resolve(nedb);
}

/**
 * Initialize nedb for a given config
 * @param {object} config
 */
async function initNedb(config) {
  const admin = config.get('admin');
  const adminPassword = config.get('adminPassword');
  const dbPath = config.get('dbPath');
  const allowConnectionAccessToEveryone = config.get(
    'allowConnectionAccessToEveryone'
  );

  mkdirp.sync(path.join(dbPath, '/cache'));

  const nedb = {
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
  await Promise.all(
    nedb.instances.map(dbname => {
      logger.info('Loading %s', dbname);
      return nedb[dbname].loadDatabase();
    })
  );

  // create default connection accesses
  if (allowConnectionAccessToEveryone) {
    logger.info('Creating access on every connection to every user...');
    await nedb.connectionAccesses.update(
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
  await nedb.users.ensureIndex({ fieldName: 'email', unique: true });
  await nedb.cache.ensureIndex({ fieldName: 'cacheKey', unique: true });
  await nedb.connectionAccesses.ensureIndex({ fieldName: 'connectionId' });
  await nedb.connectionAccesses.ensureIndex({ fieldName: 'userId' });
  await nedb.queryHistory.ensureIndex({ fieldName: 'connectionName' });
  await nedb.queryHistory.ensureIndex({ fieldName: 'userEmail' });
  await nedb.queryHistory.ensureIndex({ fieldName: 'createdDate' });

  // Set autocompaction
  nedb.instances.forEach(dbname => {
    nedb[dbname].nedb.persistence.setAutocompactionInterval(TEN_MINUTES);
  });

  // Schedule cleanups
  const models = getModels(nedb);
  setInterval(async () => {
    await models.resultCache.removeExpired();
    await models.queryHistory.removeOldEntries();
  }, FIVE_MINUTES);

  // Ensure admin is set as specified if provided
  await ensureAdmin(nedb, admin, adminPassword);

  return nedb;
}

/**
 * Initializes an nedb instance for a given config.
 * Ensures that this only happens once for a given alias.
 * If this were called multiple times weird things could happen
 * @param {object} config
 * @param {string} instanceAlias
 */
function makeNedb(config, instanceAlias = 'default') {
  // makeNedb should only be called once for a given alias
  if (instances[instanceAlias]) {
    throw new Error(`db instance ${instanceAlias} already made`);
  }
  const dbPromise = initNedb(config);
  instances[instanceAlias] = dbPromise;
  return dbPromise;
}

module.exports = {
  makeNedb,
  getNedb
};
