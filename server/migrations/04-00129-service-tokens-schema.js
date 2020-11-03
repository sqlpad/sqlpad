const Sequelize = require('sequelize');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog) {
  await queryInterface.createTable('service_tokens', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    role: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    masked_token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    duration: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    expiry_date: {
      type: Sequelize.DATE,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
    },
  });

  await queryInterface.addConstraint('service_tokens', {
    type: 'unique',
    name: 'service_tokens_name_key',
    fields: ['name'],
  });
}

module.exports = {
  up,
};
