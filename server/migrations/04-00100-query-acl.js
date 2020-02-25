const Sequelize = require('sequelize');
const consts = require('../lib/consts');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb) {
  await queryInterface.createTable('query_acl', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    query_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    write: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updated_at: {
      type: Sequelize.DATE
    }
  });

  const queries = await nedb.queries.find({});

  if (queries.length) {
    const records = queries.map(query => {
      return {
        query_id: query._id,
        user_id: consts.EVERYONE_ID,
        write: true,
        created_at: new Date(),
        updated_at: new Date()
      };
    });

    await queryInterface.bulkInsert('query_acl', records);
  }
}

module.exports = {
  up
};
