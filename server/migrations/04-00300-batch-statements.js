const Sequelize = require('sequelize');
const migrationUtils = require('../lib/migration-utils');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog) {
  /**
   * BATCH
   * For now, batch is a copy of query + additional fields to capture context
   * ========================================================
   */
  await queryInterface.createTable('batches', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    query_id: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
    connection_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    connection_client_id: {
      type: Sequelize.UUID,
    },
    status: {
      type: Sequelize.STRING,
    },
    start_time: {
      type: Sequelize.DATE,
    },
    stop_time: {
      type: Sequelize.DATE,
    },
    duration_ms: {
      type: Sequelize.INTEGER,
    },
    // Both query_text and selected_query_text are captured,
    // as user may execute just a portion of what is in their editor
    // In the future they may want to "restore" back to this version,
    // in which case we can restore back to everything
    batch_text: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    selected_text: {
      type: Sequelize.TEXT,
    },
    // Taking a snapshot of the chart config too, because that could change over time
    chart: {
      type: Sequelize.JSON,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'batches',
    'batches_user_id',
    ['user_id']
  );

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'batches',
    'batches_query_id',
    ['query_id']
  );

  /**
   * STATEMENTS
   * ========================================================
   */
  await queryInterface.createTable('statements', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    batch_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    sequence: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    statement_text: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    start_time: {
      type: Sequelize.DATE,
    },
    stop_time: {
      type: Sequelize.DATE,
    },
    duration_ms: {
      type: Sequelize.INTEGER,
    },
    columns: {
      type: Sequelize.JSON,
    },
    row_count: {
      type: Sequelize.INTEGER,
    },
    results_path: {
      type: Sequelize.STRING,
    },
    incomplete: {
      type: Sequelize.BOOLEAN,
    },
    error: {
      type: Sequelize.JSON,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'statements',
    'statements_batch_id',
    ['batch_id']
  );

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'statements',
    'statements_created_at',
    ['created_at']
  );
}

module.exports = {
  up,
};
