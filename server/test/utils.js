const assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const path = require('path');
const request = require('supertest');
const Config = require('../lib/config');
const { Sequelize } = require('sequelize');
const appLog = require('../lib/app-log');
const db = require('../lib/db');
const makeApp = require('../app');
const migrate = require('../lib/migrate');
const loadSeedData = require('../lib/load-seed-data');
const ensureConnectionAccess = require('../lib/ensure-connection-access');

// At the start of any test run, clean out the root artifacts directory
before(function (done) {
  rimraf(path.join(__dirname, '/artifacts/*'), done);
});

class TestUtils {
  constructor(args = {}) {
    const config = new Config(
      {
        // Despite being in-memory, still need a file path for cache and session files
        // Eventually these will be moved to sqlite and we can be fully-in-memory
        dbPath: path.join(__dirname, '/artifacts/defaultdb'),
        dbInMemory: true,
        appLogLevel: 'error',
        backendDatabaseUri: TestUtils.randomize_dbname(
          process.env.SQLPAD_BACKEND_DB_URI
        ),
        webLogLevel: 'error',
        authProxyEnabled: true,
        authProxyHeaders: 'email:X-WEBAUTH-EMAIL',
        ...args,
      },
      {}
    );

    // TODO - this is problematic because multiple TestUtils are created all at once in describe()
    // and last one wins. This modifies a global state,
    // so there is no way for this to be enabled just for 1 test and not another
    appLog.setLevel(config.get('appLogLevel'));

    this.config = config;
    this.appLog = appLog;
    this.instanceAlias = uuidv4();
    this.sequelizeDb = undefined;
    this.app = undefined;
    this.models = undefined;
    this.nedb = undefined;

    this.users = {
      admin: {
        id: undefined, // set if created
        email: 'admin@test.com',
        role: 'admin',
      },
      editor: {
        id: undefined, // set if created
        email: 'editor@test.com',
        role: 'editor',
      },
      editor2: {
        id: undefined, // set if created
        email: 'editor2@test.com',
        role: 'editor',
      },
    };
  }

  static randomize_dbname(uri) {
    if (!uri) return '';
    const salt = uuidv4().replace(/-/g, '');
    const u = new URL(uri);
    u.pathname += salt;
    return u.href;
  }

  prepDbDir() {
    const dbPath = this.config.get('dbPath');
    mkdirp.sync(dbPath);
    return new Promise((resolve, reject) => {
      return rimraf(path.join(dbPath, '*'), (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  async initDbs() {
    // Create DB if needed
    const backendDatabaseUri = this.config.get('backendDatabaseUri') || '';
    if (backendDatabaseUri) {
      const dbname = new URL(backendDatabaseUri).pathname.replace('/', '');
      const serverUri = backendDatabaseUri.replace(`/${dbname}`, '');
      const sequelize = new Sequelize(serverUri, {
        logging: (message) => appLog.debug(message),
      });
      try {
        await sequelize.query(`CREATE DATABASE ${dbname};`);
      } catch (e) {
        if (e.parent.message.includes('database exists')) {
          // ignore
        } else {
          throw e;
        }
      }
    }

    db.makeDb(this.config, this.instanceAlias);
    const { models, nedb, sequelizeDb } = await db.getDb(this.instanceAlias);
    this.models = models;
    this.nedb = nedb;
    this.sequelizeDb = sequelizeDb;
  }

  async migrate() {
    await migrate(
      this.config,
      this.appLog,
      this.nedb,
      this.sequelizeDb.sequelize
    );
  }

  static validateErrorBody(body) {
    assert(body.title, 'Error response has title');
  }

  static validateListSuccessBody(body) {
    assert(Array.isArray(body), 'Body is an array');
  }

  async loadSeedData() {
    await loadSeedData(this.appLog, this.config, this.models);
  }

  async addUserApiHelper(key, user) {
    const newUser = await this.models.users.create(user);
    // If user already exists, update the id, otherwise add new one (using the original data)
    if (this.users[key]) {
      this.users[key].id = newUser.id;
    } else {
      // We must use original user object passed in as it has the password. the response from .save() does not
      this.users[key] = { ...user, id: newUser.id };
    }
    return newUser;
  }

  async init(withUsers) {
    await this.prepDbDir();
    await this.initDbs();
    await this.migrate();
    await this.loadSeedData();
    await ensureConnectionAccess(this.sequelizeDb, this.config);

    this.app = await makeApp(this.config, this.models);

    assert.throws(() => {
      db.makeDb(this.config, this.instanceAlias);
    }, 'ensure nedb can be made once');

    if (withUsers) {
      for (const key of Object.keys(this.users)) {
        // eslint-disable-next-line no-await-in-loop
        await this.addUserApiHelper(key, this.users[key]);
      }
    }
  }

  async del(userKey, url, statusCode = 200) {
    const req = request(this.app).delete(url);
    if (this.users[userKey]) {
      req.set('X-WEBAUTH-EMAIL', this.users[userKey].email);
    }
    const response = await req.expect(statusCode);
    return response.body;
  }

  async get(userKey, url, statusCode = 200) {
    const req = request(this.app).get(url);
    if (this.users[userKey]) {
      req.set('X-WEBAUTH-EMAIL', this.users[userKey].email);
    }
    const response = await req.expect(statusCode);
    return response.body;
  }

  async getResponse(userKey, url, statusCode = 200) {
    const req = request(this.app).get(url);
    if (this.users[userKey]) {
      req.set('X-WEBAUTH-EMAIL', this.users[userKey].email);
    }
    return req.expect(statusCode);
  }

  async post(userKey, url, body, statusCode = 200) {
    const req = request(this.app).post(url);
    if (this.users[userKey]) {
      req.set('X-WEBAUTH-EMAIL', this.users[userKey].email);
    }
    const response = await req.send(body).expect(statusCode);
    return response.body;
  }

  async put(userKey, url, body, statusCode = 200) {
    const req = request(this.app).put(url);
    if (this.users[userKey]) {
      req.set('X-WEBAUTH-EMAIL', this.users[userKey].email);
    }
    const response = await req.send(body).expect(statusCode);
    return response.body;
  }
}

module.exports = TestUtils;
