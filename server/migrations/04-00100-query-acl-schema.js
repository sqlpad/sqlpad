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
  if (config.get('backendDatabaseUri').startsWith('mssql')) {
    await sequelizeDb.query(
      `
        IF TYPE_ID('JSON') IS NULL
        BEGIN
          CREATE TYPE [dbo].[JSON] FROM [NVARCHAR](MAX) NULL;
        END 
      `
    );
  }

  await queryInterface.createTable('query_acl', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    query_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    write: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
    },
  });

  await queryInterface.addConstraint('query_acl', {
    type: 'unique',
    name: 'query_acl_query_id_user_id_key',
    fields: ['query_id', 'user_id'],
  });
}

module.exports = {
  up,
};
