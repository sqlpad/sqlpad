const assert = require('assert')
const request = require('request-promise-native')

exports.expectKeys = function expectKeys(data, expectedKeys) {
  Object.keys(data).forEach(key =>
    assert(expectedKeys.indexOf(key) > -1, `expected key ${key}`)
  )
}

/**
 * Performs GET and parses body as JSON
 * @param {string} path - url path
 */
exports.get = function get(path) {
  const host = 'http://localhost:3010'
  const options = {
    uri: host + path,
    json: true
  }
  return request(options)
}
