/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb) {
  // For any acl entries created in 04-00110, move the "__EVERYONE__" value to groupId
  await queryInterface.bulkUpdate(
    'query_acl',
    {
      user_id: null,
      group_id: '__EVERYONE__' // value in consts.EVERYONE_ID at time of migration
    },
    {
      user_id: '__EVERYONE__' // value in consts.EVERYONE_ID at time of migration
    }
  );
}

module.exports = {
  up
};
