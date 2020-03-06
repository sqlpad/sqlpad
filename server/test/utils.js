const assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const request = require('supertest');
const Config = require('../lib/config');
const appLog = require('../lib/appLog');
const db = require('../lib/db');
const makeApp = require('../app');
const migrate = require('../lib/migrate');
const loadSeedData = require('../lib/loadSeedData');

class TestUtils {
  constructor(args = {}, env = {}) {
    const config = new Config(
      {
        debug: true,
        // Despite being in-memory, still need a file path for cache and session files
        // Eventually these will be moved to sqlite and we can be fully-in-memory
        dbPath: '../dbtest',
        dbInMemory: true,
        ...args
      },
      {
        SQLPAD_APP_LOG_LEVEL: 'silent',
        SQLPAD_WEB_LOG_LEVEL: 'silent',
        ...env
      }
    );

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
        _id: undefined, // set if created
        email: 'admin@test.com',
        password: 'admin',
        role: 'admin'
      },
      editor: {
        _id: undefined, // set if created
        email: 'editor@test.com',
        password: 'editor',
        role: 'editor'
      },
      editor2: {
        _id: undefined, // set if created
        email: 'editor2@test.com',
        password: 'editor2',
        role: 'editor2'
      }
    };
  }

  async initDbs() {
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

  async loadSeedData() {
    await loadSeedData(this.appLog, this.config, this.models);
  }

  async init(withUsers) {
    await this.initDbs();
    await this.migrate();
    await this.loadSeedData();

    this.app = makeApp(this.config, this.models);

    assert.throws(() => {
      db.makeDb(this.config, this.instanceAlias);
    }, 'ensure nedb can be made once');

    if (withUsers) {
      for (const key of Object.keys(this.users)) {
        // eslint-disable-next-line no-await-in-loop
        const newUser = await this.models.users.save(this.users[key]);
        this.users[key]._id = newUser._id;
      }
    }
  }

  addAuth(req, role) {
    if (this.users[role]) {
      const username = this.users[role].email;
      const password = this.users[role].password;
      return req.auth(username, password);
    }
    return req;
  }

  async del(role, url, statusCode = 200) {
    let req = request(this.app).delete(url);
    req = this.addAuth(req, role);
    const response = await req.expect(statusCode);
    return response.body;
  }

  async get(role, url, statusCode = 200) {
    let req = request(this.app).get(url);
    req = this.addAuth(req, role);
    const response = await req.expect(statusCode);
    return response.body;
  }

  async post(role, url, body, statusCode = 200) {
    let req = request(this.app).post(url);
    req = this.addAuth(req, role);
    const response = await req.send(body).expect(statusCode);
    return response.body;
  }

  async put(role, url, body, statusCode = 200) {
    let req = request(this.app).put(url);
    req = this.addAuth(req, role);
    const response = await req.send(body).expect(statusCode);
    return response.body;
  }
}

module.exports = TestUtils;
