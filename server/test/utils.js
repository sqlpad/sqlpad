const assert = require('assert');
const minimist = require('minimist');
const request = require('supertest');
const consts = require('../lib/consts');
const Config = require('../lib/config');
const appLog = require('../lib/appLog');
const ndb = require('../lib/db');
const sequelizeDb = require('../sequelize');
const makeApp = require('../app');
const migrate = require('../lib/migrate');

const argv = minimist(process.argv.slice(2));

// TODO - restructure test utils to allow injecting different configurations
// config values can be supplied directly, parsing different sources can be tested separately
const config = new Config(argv);

let app;

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

function expectKeys(data, expectedKeys) {
  Object.keys(data).forEach(key =>
    assert(expectedKeys.includes(key), `expected key ${key}`)
  );
}

async function reset() {
  const { nedb } = await ndb.getDb();
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

async function resetWithUser() {
  await reset();
  const { models } = await ndb.getDb();
  const saves = Object.keys(users).map(key => {
    return models.users.save(users[key]);
  });
  return Promise.all(saves);
}

function addAuth(req, role) {
  if (users[role]) {
    const username = users[role].email;
    const password = users[role].password;
    return req.auth(username, password);
  }
  return req;
}

async function del(role, url, statusCode = 200) {
  let req = request(app).delete(url);
  req = addAuth(req, role);
  const response = await req.expect(statusCode);
  return response.body;
}

async function get(role, url, statusCode = 200) {
  let req = request(app).get(url);
  req = addAuth(req, role);
  const response = await req.expect(statusCode);
  return response.body;
}

async function post(role, url, body, statusCode = 200) {
  let req = request(app).post(url);
  req = addAuth(req, role);
  const response = await req.send(body).expect(statusCode);
  return response.body;
}

async function put(role, url, body, statusCode = 200) {
  let req = request(app).put(url);
  req = addAuth(req, role);
  const response = await req.send(body).expect(statusCode);
  return response.body;
}

before(async function() {
  ndb.makeDb(config);
  const { models, nedb } = await ndb.getDb();
  appLog.setLevel(config.get('appLogLevel'));

  const sdb = sequelizeDb.makeDb(config);
  await migrate(config, appLog, nedb, sdb.sequelize);

  app = makeApp(config, models);

  assert.throws(() => {
    ndb.makeDb(config);
  }, 'ensure nedb can be made once');

  return resetWithUser();
});

module.exports = {
  config,
  del,
  expectKeys,
  get,
  post,
  put,
  reset,
  resetWithUser
};
