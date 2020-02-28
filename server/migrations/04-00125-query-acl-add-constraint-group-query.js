/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb) {
  await queryInterface.addConstraint('query_acl', ['group_id', 'query_id'], {
    type: 'unique',
    name: 'query_acl_group_id_query_id_key'
  });
}

module.exports = {
  up
};
