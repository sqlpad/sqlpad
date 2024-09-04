import appLog from './app-log.js';
import consts from './consts.js';

/**
 * Ensure admin email is a user if provided
 * If password is provided, update password
 * @param {*} sequelizeDb
 * @param {import('./config')} config
 */
async function ensureConnectionAccess(sequelizeDb, config) {
  if (config.get('allowConnectionAccessToEveryone')) {
    const existing = await sequelizeDb.ConnectionAccesses.findOne({
      where: {
        connectionId: consts.EVERY_CONNECTION_ID,
        userId: consts.EVERYONE_ID,
      },
    });
    if (!existing) {
      appLog.info('Creating access on every connection to every user...');
      await sequelizeDb.ConnectionAccesses.create({
        connectionId: consts.EVERY_CONNECTION_ID,
        connectionName: consts.EVERY_CONNECTION_NAME,
        userId: consts.EVERYONE_ID,
        userEmail: consts.EVERYONE_EMAIL,
        duration: 0,
        expiryDate: new Date(new Date().setFullYear(2099)),
      });
    }
  }
}

export default ensureConnectionAccess;
