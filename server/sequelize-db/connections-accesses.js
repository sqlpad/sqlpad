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
      // Number of seconds connection access is valid from creation
      // Used to set expiryDate
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
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
