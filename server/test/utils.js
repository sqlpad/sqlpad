const assert = require('assert')
const User = require('../models/User')
const db = require('../lib/db')

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
  return reset()
    .then(() => {
      const user = new User({
        email: 'admin@test.com',
        password: 'admin',
        role: 'admin'
      })
      return user.save()
    })
    .then(() => {
      const user = new User({
        email: 'editor@test.com',
        password: 'editor',
        role: 'editor'
      })
      return user.save()
    })
}

module.exports = {
  expectKeys,
  reset,
  resetWithUser
}
