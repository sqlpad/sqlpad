import path from 'path';
import mkdirp from 'mkdirp';
import Models from '../models/index.js';
import SequelizeDb from '../sequelize-db/index.js';

/**
 * Whenever possible, the database (db) should be read from the app req object.
 * Sometimes, this isn't possible or convenient at the moment, however.
 * For those cases, this module provides access by caching the db instance.
 * Safety measures have been added to ensure only 1 instance of the db can be initialized per alias.
 */
const instances = {};

/**
 * Returns a promise of the db instance.
 * @param {string} [instanceAlias]
 * @returns {Promise<{ models: Models, sequelizeDb: SequelizeDb }>}
 */
export async function getDb(instanceAlias = 'default') {
  const instancePromise = instances[instanceAlias];
  if (!instancePromise) {
    throw new Error('db instance must be created first');
  }
  // already be a promise -- this just makes it explicit
  const { models, sequelizeDb } = await instancePromise;
  return { models, sequelizeDb };
}

/**
 * Initializes the db for a given config.
 * @param {object} config
 * @returns {Promise<{ models: Models, sequelizeDb: SequelizeDb }>}
 */
async function initDb(config) {
  const dbPath = config.get('dbPath');
  mkdirp.sync(path.join(dbPath, '/cache'));

  const sequelizeDb = new SequelizeDb(config);
  const models = new Models(sequelizeDb, config);

  return { models, sequelizeDb };
}

/**
 * Initializes a db instance for a given config.
 * Ensures that this only happens once for a given alias.
 * If this were called multiple times, weird things could happen.
 * @param {object} config
 * @param {string} instanceAlias
 * @returns {boolean}
 */
export function makeDb(config, instanceAlias = 'default') {
  // makeDb should only be called once for a given alias
  if (instances[instanceAlias]) {
    throw new Error(`db instance ${instanceAlias} already made`);
  }
  const dbPromise = initDb(config);
  instances[instanceAlias] = dbPromise;
  return true;
}
