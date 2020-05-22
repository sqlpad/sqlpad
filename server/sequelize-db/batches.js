const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  const Batches = sequelize.define(
    'Batches',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      queryId: {
        type: DataTypes.STRING,
        allowNull: false,
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
          // We have no way of cancelling current statement but future could be
          isIn: [['started', 'finished', 'error']],
        },
        defaultValue: 'started',
      },
      startTime: {
        type: DataTypes.DATE,
      },
      stopTime: {
        type: DataTypes.DATE,
      },
      // Both query_text and selected_query_text is captured,
      // as user may execute just a portion of what is in their editor
      // In the future they may want to "restore" back to this version,
      // in which case we can restore back to everything
      batchText: {
        type: DataTypes.TEXT,
      },
      selectedText: {
        type: DataTypes.TEXT,
      },
      // Taking a snapshot of the chart config too, because that could change over time
      chart: {
        type: DataTypes.JSON,
      },
      // Users create them but not update (the system does though)
      createdBy: {
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
