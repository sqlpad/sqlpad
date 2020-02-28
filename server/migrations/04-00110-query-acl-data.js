/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb) {
  const queries = await nedb.queries.find({});

  if (queries.length) {
    const records = queries.map(query => {
      return {
        query_id: query._id,
        user_id: '__EVERYONE__', // value in consts.EVERYONE_ID at time of migration
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
