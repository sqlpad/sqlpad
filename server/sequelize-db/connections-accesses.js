const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  const ConnectionAccesses = sequelize.define(
    'ConnectionAccesses',
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
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 86400,
        },
      },
      expiryDate: {
        type: DataTypes.DATE,
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
      tableName: 'connection_accesses',
      underscored: true,
    }
  );

  return ConnectionAccesses;
};
