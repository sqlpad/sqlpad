const Sequelize = require('sequelize');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog) {
  /**
   * sessions table is used for web user sessions
   */
  await queryInterface.createTable('sessions', {
    sid: {
      type: Sequelize.STRING(36),
      primaryKey: true,
    },
    expires: {
      type: Sequelize.DATE,
    },
    data: {
      type: Sequelize.TEXT,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
    },
  });
}

module.exports = {
  up,
};
