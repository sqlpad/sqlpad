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
      // For historical reasons, queryId can be any string
      queryId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'query_acl_query_id_user_id_key'
      },
      // For historical reasons, userId can be any string
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'query_acl_query_id_user_id_key'
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
