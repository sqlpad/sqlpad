const assert = require('assert');
const uuid = require('uuid');
const request = require('supertest');
const consts = require('../lib/consts');
const Config = require('../lib/config');
const appLog = require('../lib/appLog');
const { makeDb, getDb } = require('../lib/db');
const makeApp = require('../app');

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

class TestUtil {
  constructor(args = {}, env = {}) {
    const config = new Config(
      {
        debug: true,
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

    makeDb(config, this.instanceAlias);
    this.app = undefined;
  }

  async init() {
    const { models } = await getDb(this.instanceAlias);

    this.models = models;
    this.app = makeApp(this.config, models);

    assert.throws(() => {
      makeDb(this.config, this.instanceAlias);
    }, 'ensure nedb can be made once');

    return this.resetWithUser();
  }

  async reset() {
    const { nedb } = await getDb(this.instanceAlias);
    return Promise.all([
      nedb.users.remove({}, { multi: true }),
      nedb.queries.remove({}, { multi: true }),
      nedb.queryHistory.remove({}, { multi: true }),
      nedb.connections.remove({}, { multi: true }),
      nedb.connectionAccesses.remove(
        {
          $not: {
            $and: [
              { connectionId: consts.EVERY_CONNECTION_ID },
              { userId: consts.EVERYONE_ID }
            ]
          }
        },
        { multi: true }
      )
    ]);
  }

  async resetWithUser() {
    await this.reset();
    const { models } = await getDb(this.instanceAlias);
    const saves = Object.keys(users).map(key => {
      return models.users.save(users[key]);
    });
    return Promise.all(saves);
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

function expectKeys(data, expectedKeys) {
  Object.keys(data).forEach(key =>
    assert(expectedKeys.includes(key), `expected key ${key}`)
  );
}

function addAuth(req, role) {
  if (users[role]) {
    const username = users[role].email;
    const password = users[role].password;
    return req.auth(username, password);
  }
  return req;
}

const testUtil = new TestUtil();

testUtil.expectKeys = expectKeys;

before(async function() {
  await testUtil.init();
});

module.exports = testUtil;
