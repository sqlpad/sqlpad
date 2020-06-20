const Sequelize = require('sequelize');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 * @param {object} sequelizeDb - sequelize instance
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb, sequelizeDb) {
  await sequelizeDb.query(
    `
      UPDATE connections
      SET driver = 'redshift'
      WHERE driver = 'redshiftSpectrum' 
    `,
    {
      type: Sequelize.QueryTypes.UPDATE,
    }
  );
}

module.exports = {
  up,
};
