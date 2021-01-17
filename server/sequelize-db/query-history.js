const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  const QueryHistory = sequelize.define(
    'QueryHistory',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      connectionId: {
        type: DataTypes.STRING,
      },
      connectionName: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.STRING,
      },
      userEmail: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.TEXT,
      },
      startTime: {
        type: DataTypes.DATE,
      },
      stopTime: {
        type: DataTypes.DATE,
      },
      durationMs: {
        type: DataTypes.INTEGER,
      },
      queryId: {
        type: DataTypes.STRING,
      },
      queryName: {
        type: DataTypes.STRING,
      },
      queryText: {
        type: DataTypes.TEXT,
      },
      incomplete: {
        type: DataTypes.BOOLEAN,
      },
      rowCount: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'vw_query_history',
      underscored: true,
      updatedAt: false,
      createdAt: false,
    }
  );

  return QueryHistory;
};
