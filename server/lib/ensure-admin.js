const appLog = require('./app-log');

/**
 * Ensure admin email is a user if provided
 * If password is provided, update password
 * @param {import('../models')} models
 * @param {import('./config')} config
 */
async function ensureAdmin(models, config) {
  const adminEmail = config.get('admin');
  const adminPassword = config.get('adminPassword');

  if (!adminEmail) {
    return;
  }

  try {
    // if an admin was passed in the command line, check to see if a user exists with that email
    // if so, set the admin to true
    // if not, add the email address.
    // Then log that the person should visit the signup url to finish registration.
    const user = await models.users.findOneByEmail(adminEmail);
    if (user) {
      const changes = { role: 'admin' };
      if (adminPassword) {
        changes.password = adminPassword;
      }
      await models.users.update(user.id, changes);
      appLog.info('Admin access granted to %s', adminEmail);
      return;
    }

    const newAdmin = {
      email: adminEmail,
      role: 'admin',
    };
    if (adminPassword) {
      newAdmin.password = adminPassword;
    }
    await models.users.create(newAdmin);
    appLog.info('Admin access granted to %s', adminEmail);
    appLog.info('Please visit signup to complete registration.');
  } catch (error) {
    appLog.error('Admin access grant failed for %s', adminEmail);
    throw error;
  }
}

module.exports = ensureAdmin;
