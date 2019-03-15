const crypto = require('crypto');
const algorithm = 'aes256';
const { passphrase } = require('../lib/config').getPreDbConfig();

/**
 * @param {string} gibberish ciphered value that needs deciphering
 * @returns {string} deciphered value
 */
module.exports = function decipher(gibberish) {
  let returnValue = '';
  try {
    const myDecipher = crypto.createDecipher(algorithm, passphrase);
    returnValue =
      myDecipher.update(gibberish, 'hex', 'utf8') + myDecipher.final('utf8');
  } catch (e) {
    console.error(e);
  }
  return returnValue;
};
