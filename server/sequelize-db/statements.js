const Sequelize = require('sequelize');

module.exports = function (sequelize) {
  const Statements = sequelize.define(
    'Statements',
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      batchId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      statementText: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      // If a batch errors, any statements following error will be "cancelled" status
      // At this time statements/batches cannot be cancelled otherwise
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['queued', 'started', 'finished', 'error', 'cancelled']],
        },
        defaultValue: 'queued',
      },
      startTime: {
        type: Sequelize.DATE,
      },
      stopTime: {
        type: Sequelize.DATE,
      },
      durationMs: {
        type: Sequelize.INTEGER,
      },
      columns: {
        type: Sequelize.JSON,
      },
      rowCount: {
        type: Sequelize.INTEGER,
      },
      resultsPath: {
        type: Sequelize.STRING,
      },
      incomplete: {
        type: Sequelize.BOOLEAN,
      },
      error: {
        type: Sequelize.JSON,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'statements',
      underscored: true,
    }
  );

  return Statements;
};
