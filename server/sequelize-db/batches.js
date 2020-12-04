const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  const Batches = sequelize.define(
    'Batches',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      // A batch can be run without saving the query
      queryId: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      connectionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      connectionClientId: {
        type: DataTypes.UUID,
      },
      status: {
        type: DataTypes.STRING,
        validate: {
          // Potentially add 'cancelled'?
          // We have no way of canceling current statement but future could be
          // If a batch errors, any statements following error will be "cancelled" status
          isIn: [['started', 'finished', 'error']],
        },
        defaultValue: 'started',
      },
      startTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      stopTime: {
        type: DataTypes.DATE,
      },
      durationMs: {
        type: DataTypes.INTEGER,
      },
      // Both query_text and selected_query_text is captured,
      // as user may execute just a portion of what is in their editor
      // In the future they may want to "restore" back to this version,
      // in which case we can restore back to everything
      batchText: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      selectedText: {
        type: DataTypes.TEXT,
      },
      // Taking a snapshot of the chart config too, because that could change over time
      chart: {
        type: DataTypes.JSON,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'batches',
      underscored: true,
    }
  );

  return Batches;
};
