const crypto = require('crypto');
const algorithm = 'aes256';
const config = require('../lib/config');

const passphrase = config.get('passphrase');

module.exports = function(text) {
  const myCipher = crypto.createCipher(algorithm, passphrase);
  return myCipher.update(text, 'utf8', 'hex') + myCipher.final('hex');
};
