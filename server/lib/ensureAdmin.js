const passhash = require('./passhash');
const logger = require('./logger');

/**
 * Ensure admin email is a user if provided
 * If password is provided, update password
 * @param {object} nedb
 * @param {string} adminEmail
 * @param {string} adminPassword
 */
async function ensureAdmin(nedb, adminEmail, adminPassword) {
  if (!adminEmail) {
    return;
  }

  try {
    // if an admin was passed in the command line, check to see if a user exists with that email
    // if so, set the admin to true
    // if not, whitelist the email address.
    // Then log that the person should visit the signup url to finish registration.
    const user = await nedb.users.findOne({ email: adminEmail });
    if (user) {
      const changes = { role: 'admin' };
      if (adminPassword) {
        changes.passhash = await passhash.getPasshash(adminPassword);
      }
      await nedb.users.update({ _id: user._id }, { $set: changes }, {});
      logger.info('Admin access granted to %s', adminEmail);
      return;
    }

    const newAdmin = {
      email: adminEmail,
      role: 'admin'
    };
    if (adminPassword) {
      newAdmin.passhash = await passhash.getPasshash(adminPassword);
    }
    await nedb.users.insert(newAdmin);
    logger.info('Admin access granted to %s', adminEmail);
    logger.info('Please visit signup to complete registration.');
  } catch (error) {
    logger.error('Admin access grant failed for %s', adminEmail);
    throw error;
  }
}

module.exports = ensureAdmin;
