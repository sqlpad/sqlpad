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
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['queued', 'started', 'finished', 'error']],
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
