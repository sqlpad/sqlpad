const crypto = require('crypto');
const algorithm = 'aes256';

module.exports = function makeCipher(passphrase) {
  return {
    cipher: (text) => {
      // TODO createCipher is deprecated
      const myCipher = crypto.createCipher(algorithm, passphrase);
      return myCipher.update(text, 'utf8', 'hex') + myCipher.final('hex');
    },
    decipher: (gibberish) => {
      const myDecipher = crypto.createDecipher(algorithm, passphrase);
      return (
        myDecipher.update(gibberish, 'hex', 'utf8') + myDecipher.final('utf8')
      );
    },
  };
};
