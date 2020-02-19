const assert = require('assert');
const request = require('supertest');
const getModels = require('../models');
const consts = require('../lib/consts');
const config = require('../lib/config');
const { makeNedb } = require('../lib/db');
const makeApp = require('../app');

const dbPromise = makeNedb(config);
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
  const nedb = await dbPromise;
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
  const nedb = await dbPromise;
  const models = getModels(nedb);
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
  await dbPromise;
  let req = request(app).delete(url);
  req = addAuth(req, role);
  const response = await req.expect(statusCode);
  return response.body;
}

async function get(role, url, statusCode = 200) {
  await dbPromise;
  let req = request(app).get(url);
  req = addAuth(req, role);
  const response = await req.expect(statusCode);
  return response.body;
}

async function post(role, url, body, statusCode = 200) {
  await dbPromise;
  let req = request(app).post(url);
  req = addAuth(req, role);
  const response = await req.send(body).expect(statusCode);
  return response.body;
}

async function put(role, url, body, statusCode = 200) {
  await dbPromise;
  let req = request(app).put(url);
  req = addAuth(req, role);
  const response = await req.send(body).expect(statusCode);
  return response.body;
}

before(async function() {
  const nedb = await dbPromise;
  app = makeApp(config, nedb);

  assert.throws(() => {
    makeNedb(config);
  }, 'ensure nedb can be made once');

  return resetWithUser();
});

module.exports = {
  del,
  expectKeys,
  get,
  post,
  put,
  reset,
  resetWithUser
};
