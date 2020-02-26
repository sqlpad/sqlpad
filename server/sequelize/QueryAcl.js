const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  // An entry in this table gives access to a query for a user or user id constant
  const QueryAcl = sequelize.define(
    'QueryAcl',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      // For historical reasons, queryId can be anything
      queryId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // For historical reasons, userId can be anything
      userId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      write: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    },
    {
      tableName: 'query_acl',
      underscored: true
    }
  );

  return QueryAcl;
};
