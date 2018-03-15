const assert = require('assert')
const request = require('supertest')
const User = require('../models/User')
const db = require('../lib/db')
const app = require('../app')

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
}

function expectKeys(data, expectedKeys) {
  Object.keys(data).forEach(key =>
    assert(expectedKeys.includes(key), `expected key ${key}`)
  )
}

function reset() {
  return Promise.all([
    db.users.remove({}, { multi: true }),
    db.queries.remove({}, { multi: true }),
    db.connections.remove({}, { multi: true }),
    db.config.remove({}, { multi: true })
  ])
}

function resetWithUser() {
  return reset().then(() => {
    const saves = Object.keys(users).map(key => {
      const user = new User(users[key])
      return user.save()
    })
    return Promise.all(saves)
  })
}

function addAuth(req, role) {
  if (users[role]) {
    const username = users[role].email
    const password = users[role].password
    return req.auth(username, password)
  }
  return req
}

function del(role, url, statusCode = 200) {
  let req = request(app).delete(url)
  req = addAuth(req, role)
  return req.expect(statusCode).then(response => response.body)
}

function get(role, url, statusCode = 200) {
  let req = request(app).get(url)
  req = addAuth(req, role)
  return req.expect(statusCode).then(response => response.body)
}

function post(role, url, body, statusCode = 200) {
  let req = request(app).post(url)
  req = addAuth(req, role)
  return req
    .send(body)
    .expect(statusCode)
    .then(response => response.body)
}

function put(role, url, body, statusCode = 200) {
  let req = request(app).put(url)
  req = addAuth(req, role)
  return req
    .send(body)
    .expect(statusCode)
    .then(response => response.body)
}

module.exports = {
  del,
  expectKeys,
  get,
  post,
  put,
  reset,
  resetWithUser
}
