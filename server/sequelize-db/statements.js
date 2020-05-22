const Sequelize = require('sequelize');

module.exports = function (sequelize) {
  const Statements = sequelize.define(
    'Statements',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      batchId: {
        type: Sequelize.INTEGER,
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
        defaultValue: Sequelize.NOW,
      },
      stopTime: {
        type: Sequelize.DATE,
      },
      columns: {
        type: Sequelize.JSON,
      },
      row_count: {
        type: Sequelize.INTEGER,
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
