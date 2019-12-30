const crypto = require('crypto');
const algorithm = 'aes256';
const config = require('../lib/config');
const passphrase = config.get('passphrase');

/**
 * @param {string} gibberish ciphered value that needs deciphering
 * @returns {string} deciphered value
 */
module.exports = function decipher(gibberish) {
  const myDecipher = crypto.createDecipher(algorithm, passphrase);
  return myDecipher.update(gibberish, 'hex', 'utf8') + myDecipher.final('utf8');
};
