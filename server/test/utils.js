const assert = require('assert');
const uuid = require('uuid');
const request = require('supertest');
const Config = require('../lib/config');
const appLog = require('../lib/appLog');
const ndb = require('../lib/db');
const sequelizeDb = require('../sequelize');
const makeApp = require('../app');
const migrate = require('../lib/migrate');

const users = {
  admin: {
    email: 'admin@test.com',
    password: 'admin',
    role: 'admin'
  },
  editor: {
    email: 'editor@test.com',
    password: 'editor',
    role: 'editor'
  }
};

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
    this.instanceAlias = uuid.v1();

    ndb.makeDb(config, this.instanceAlias);
    this.app = undefined;
  }

  async init(withUsers) {
    const { models, nedb } = await ndb.getDb(this.instanceAlias);

    this.models = models;

    const sdb = sequelizeDb.makeDb(this.config);
    await migrate(this.config, appLog, nedb, sdb.sequelize);

    this.app = makeApp(this.config, models);

    assert.throws(() => {
      ndb.makeDb(this.config, this.instanceAlias);
    }, 'ensure nedb can be made once');

    if (withUsers) {
      const saves = Object.keys(users).map(key => {
        return models.users.save(users[key]);
      });
      await Promise.all(saves);
    }
  }

  async del(role, url, statusCode = 200) {
    let req = request(this.app).delete(url);
    req = addAuth(req, role);
    const response = await req.expect(statusCode);
    return response.body;
  }

  async get(role, url, statusCode = 200) {
    let req = request(this.app).get(url);
    req = addAuth(req, role);
    const response = await req.expect(statusCode);
    return response.body;
  }

  async post(role, url, body, statusCode = 200) {
    let req = request(this.app).post(url);
    req = addAuth(req, role);
    const response = await req.send(body).expect(statusCode);
    return response.body;
  }

  async put(role, url, body, statusCode = 200) {
    let req = request(this.app).put(url);
    req = addAuth(req, role);
    const response = await req.send(body).expect(statusCode);
    return response.body;
  }
}

function addAuth(req, role) {
  if (users[role]) {
    const username = users[role].email;
    const password = users[role].password;
    return req.auth(username, password);
  }
  return req;
}

module.exports = TestUtils;
