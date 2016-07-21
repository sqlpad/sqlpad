var crypto = require('crypto');
var algorithm = 'aes256';
var config = require('./config.js');

module.exports = function (text) {
    var myCipher = crypto.createCipher(algorithm, config.get('passphrase'));
    return myCipher.update(text, 'utf8', 'hex') + myCipher.final('hex');
}