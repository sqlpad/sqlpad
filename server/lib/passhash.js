const bcrypt = require('bcrypt-nodejs');

/**
 * Compares password string to passhash string
 * @param {string} password
 * @param {string} passhash
 * @returns {Promise<boolean>}
 */
function comparePassword(password, passhash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, passhash, (err, isMatch) => {
      if (err) {
        return reject(err);
      }
      resolve(isMatch);
    });
  });
}

function getPasshash(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, null, null, (err, hash) => {
      if (err) {
        return reject(err);
      }
      return resolve(hash);
    });
  });
}

module.exports = {
  comparePassword,
  getPasshash
};
