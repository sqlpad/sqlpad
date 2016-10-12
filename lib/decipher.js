var crypto = require('crypto')
var algorithm = 'aes256'
var config = require('./config.js')

module.exports = function decipher (gibberish) {
  var returnValue = ''
  try {
    var myDecipher = crypto.createDecipher(algorithm, config.get('passphrase'))
    returnValue = myDecipher.update(gibberish, 'hex', 'utf8') + myDecipher.final('utf8')
  } catch (e) {
    console.error(e)
  }
  return returnValue
}
