/**
 * This is just an empty placeholder migration to serve as a major version marker
 *
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog) {
  return true;
}

module.exports = {
  up,
};
