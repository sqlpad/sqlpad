const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  // An entry in this table gives access to a query for a user_id, user_email, or group_id
  const ServiceTokens = sequelize.define(
    'ServiceTokens',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true
      },
      maskedToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      duration: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 730
        }
      },
      expiryDate: {
        type: DataTypes.DATE
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
      tableName: 'service_tokens',
      underscored: true
    }
  );

  return ServiceTokens;
};
