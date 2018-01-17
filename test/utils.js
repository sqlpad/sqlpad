const assert = require('assert')

exports.expectKeys = function expectKeys(data, expectedKeys) {
  Object.keys(data).forEach(key =>
    assert(expectedKeys.indexOf(key) > -1, `expected key ${key}`)
  )
}
