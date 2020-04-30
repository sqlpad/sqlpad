const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  const QueryHistory = sequelize.define(
    'QueryHistory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      connectionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      connectionName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.DATE,
      },
      stopTime: {
        type: DataTypes.DATE,
      },
      queryRunTime: {
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'query_history',
      underscored: true,
      updatedAt: false,
    }
  );

  return QueryHistory;
};
