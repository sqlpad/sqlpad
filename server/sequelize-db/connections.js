const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  const Connections = sequelize.define(
    'Connections',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      tableName: 'connections',
      underscored: true
    }
  );

  return Connections;
};
