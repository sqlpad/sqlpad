const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 * @param {object} sequelizeDb - sequelize instance
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb, sequelizeDb) {
  /**
   * batches can now take the place of query_history,
   * as it acts as a log of queries that have been run.
   *
   * Existing query_history records are inserted into batches.
   * Then a view is created to translate batches and other tables
   * into a wide table, used for reporting.
   *
   * The query_history table is then dropped,
   * as it is no longer necessary.
   * ========================================================
   */

  let rows = await sequelizeDb.query(
    `
      SELECT 
        connection_id, 
        user_id, 
        start_time, 
        stop_time,
        query_run_time AS duration_ms,
        query_id,
        query_name AS name,
        query_text AS batch_text,
        created_at
      FROM 
        query_history
    `,
    {
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  rows = rows.map((row) => {
    return {
      ...row,
      id: uuidv4(),
      selected_text: row.batch_text,
      status: 'finished',
      updated_at: row.created_at,
    };
  });

  if (rows.length) {
    await queryInterface.bulkInsert('batches', rows);
  }

  await sequelizeDb.query(
    `
      CREATE VIEW vw_query_history AS 
        SELECT 
          b.id,
          b.query_id,
          b.name AS query_name,
          b.connection_id,
          c.name AS connection_name,
          b.status,
          b.start_time,
          b.stop_time,
          b.duration_ms,
          b.selected_text AS query_text,
          b.user_id,
          u.email AS user_email
        FROM 
          batches b
          LEFT JOIN users u ON b.user_id = u.id
          LEFT JOIN connections c ON b.connection_id = c.id
    `,
    {
      type: Sequelize.QueryTypes.RAW,
    }
  );

  await queryInterface.dropTable('query_history');
}

module.exports = {
  up,
};
