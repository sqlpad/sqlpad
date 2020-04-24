const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  const Connections = sequelize.define(
    'Connections',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      driver: {
        type: DataTypes.STRING,
        allowNull: false
      },
      multiStatementTransactionEnabled: {
        type: DataTypes.BOOLEAN
      },
      idleTimeoutSeconds: {
        type: DataTypes.INTEGER
      },
      data: {
        type: DataTypes.TEXT
      },
      // Originally createdDate
      createdAt: {
        type: DataTypes.DATE
      },
      // Originally modifiedDate
      updatedAt: {
        type: DataTypes.DATE
      }
    },
    {
      tableName: 'connections',
      underscored: true
    }
  );

  return Connections;
};
