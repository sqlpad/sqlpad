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
async function getPasshash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

module.exports = {
  comparePassword,
  getPasshash,
};
