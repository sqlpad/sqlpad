const assert = require('assert')
const User = require('../models/User')
const Query = require('../models/Query')
const Connection = require('../models/Connection')

exports.expectKeys = function expectKeys(data, expectedKeys) {
  Object.keys(data).forEach(key =>
    assert(expectedKeys.includes(key), `expected key ${key}`)
  )
}

exports.reset = function reset() {
  return Promise.all(
    User._removeAll(),
    Query._removeAll(),
    Connection._removeAll()
  )
}
