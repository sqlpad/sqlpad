const assert = require('assert')
const User = require('../models/User')
const Query = require('../models/Query')
const Connection = require('../models/Connection')
const db = require('../lib/db')

function expectKeys(data, expectedKeys) {
  Object.keys(data).forEach(key =>
    assert(expectedKeys.includes(key), `expected key ${key}`)
  )
}

function reset() {
  // TODO just use nedb directly here, remove _removeAll methods
  return Promise.all([
    User._removeAll(),
    Query._removeAll(),
    Connection._removeAll(),
    db.config.remove({}, { multi: true })
  ])
}

function resetWithUser() {
  return reset().then(() => {
    const user = new User({
      email: 'admin@test.com',
      password: 'admin',
      role: 'admin'
    })
    return user.save()
  })
}

module.exports = {
  expectKeys,
  reset,
  resetWithUser
}
