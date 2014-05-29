var crypto = require('crypto');
var algorithm = 'aes256';

module.exports = function (app) {
    
    function cipher (text) {
        var myCipher = crypto.createCipher(algorithm, app.get('passphrase'));
        return myCipher.update(text, 'utf8', 'hex') + myCipher.final('hex');
    }
    
    function decipher (gibberish) {
        var returnValue = "";
        try {
            var myDecipher = crypto.createDecipher(algorithm, app.get('passphrase'));
            returnValue = myDecipher.update(gibberish, 'hex', 'utf8') + myDecipher.final('utf8');    
        }
        finally {
            return returnValue;    
        }
    }
    
    app.set('cipher', cipher);
    app.set('decipher', decipher);
};