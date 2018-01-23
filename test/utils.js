const assert = require('assert')

exports.expectKeys = function expectKeys(data, expectedKeys) {
  Object.keys(data).forEach(key =>
    assert(expectedKeys.includes(key), `expected key ${key}`)
  )
}
