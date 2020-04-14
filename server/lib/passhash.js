const bcrypt = require('bcryptjs');

/**
 * Compares password string to passhash string
 * @param {string} password
 * @param {string} passhash
 * @returns {Promise<boolean>}
 */
function comparePassword(password, passhash) {
  return bcrypt.compare(password, passhash);
}

/**
 * Returns bcrypt hash of password
 * @param {string} password
 */
function getPasshash(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        if (err) {
          return reject(err);
        }
        return resolve(hash);
      });
    });
  });
}

module.exports = {
  comparePassword,
  getPasshash
};
