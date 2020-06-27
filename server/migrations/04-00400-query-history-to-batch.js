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
        created_at,
        row_count,
        incomplete
      FROM 
        query_history
    `,
    {
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  const batchRows = [];
  const statementRows = [];

  rows.forEach((row) => {
    const { incomplete, row_count, ...batch } = row;
    const batchId = uuidv4();
    batchRows.push({
      ...batch,
      id: batchId,
      selected_text: row.batch_text,
      status: 'finished',
      updated_at: row.created_at,
    });
    statementRows.push({
      id: uuidv4(),
      sequence: 1,
      batch_id: batchId,
      statement_text: row.batch_text,
      status: 'finished',
      start_time: row.start_time,
      stop_time: row.stop_time,
      duration_ms: row.duration_ms,
      incomplete,
      row_count,
      created_at: row.created_at,
      updated_at: row.created_at,
    });
  });

  if (batchRows.length) {
    await queryInterface.bulkInsert('batches', batchRows);
    await queryInterface.bulkInsert('statements', statementRows);
  }

  await sequelizeDb.query(
    `
      CREATE VIEW vw_query_history AS 
        WITH statement_summary AS (
          SELECT 
            batch_id, 
            SUM(row_count) AS row_count, 
            MAX(CAST(incomplete AS INTEGER)) AS incomplete
          FROM 
            statements
          GROUP BY 
            batch_id
        )
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
          u.email AS user_email,
          ss.row_count,
          ss.incomplete
        FROM 
          batches b
          LEFT JOIN users u ON b.user_id = u.id
          LEFT JOIN connections c ON b.connection_id = c.id
          LEFT JOIN statement_summary ss ON b.id = ss.batch_id
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
