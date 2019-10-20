const crypto = require('crypto');
const algorithm = 'aes256';
const config = require('../lib/config');
const passphrase = config.get('passphrase');
const logger = require('../lib/config');

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
    logger.error({ err: e }, 'Failed to decipher');
  }
  return returnValue;
};
