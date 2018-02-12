const crypto = require('crypto')
const algorithm = 'aes256'
const { passphrase } = require('../lib/config').getPreDbConfig()

module.exports = function(text) {
  const myCipher = crypto.createCipher(algorithm, passphrase)
  return myCipher.update(text, 'utf8', 'hex') + myCipher.final('hex')
}
