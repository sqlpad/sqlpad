const Sequelize = require('sequelize');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} sequelizeDb - sequelize instance
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, sequelizeDb) {
  /**
   * vw_query_history is not accurately converting batches to query history correctly
   * The view should show batch text if selected text is null or empty
   *
   * Because of the various backends supported, the operation here will be to drop and then recreate the view
   * There should be no dependencies on this view, and it is guaranteed to exist at run time of this migration
   *
   * First try and drop view.
   * To ensure this migration remains idempotent we'll ignore failure here
   */
  try {
    await sequelizeDb.query(`DROP VIEW vw_query_history`);
  } catch (error) {
    appLog.error(error, `Error dropping view vw_query_history`);
  }

  let castType = 'INTEGER';
  if (config.get('backendDatabaseUri').startsWith('mysql')) {
    castType = 'UNSIGNED';
  }

  await sequelizeDb.query(
    `
      CREATE VIEW vw_query_history AS 
        WITH statement_summary AS (
          SELECT 
            batch_id, 
            SUM(row_count) AS row_count, 
            MAX(CAST(incomplete AS ${castType})) AS incomplete
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
          CASE 
            WHEN b.selected_text = '' OR b.selected_text IS NULL THEN b.batch_text 
            ELSE b.selected_text 
            END AS query_text,
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
}

module.exports = {
  up,
};
