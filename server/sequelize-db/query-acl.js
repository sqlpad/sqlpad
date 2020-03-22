const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  // An entry in this table gives access to a query for a user_id, user_email, or group_id
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
        allowNull: false
      },
      // For historical reasons, userId can be any string
      userId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // Email address can also be specified if userId is not known
      userEmail: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // The "Group" data model does not exist yet today but some day maybe will
      // It is intended to be a generic grouping mechanism
      // For now it'll contain special group values like "__EVERYONE__" found in consts.EVERYONE_ID
      // This prevents putting non-user-id values in userId column.
      groupId: {
        type: DataTypes.STRING,
        allowNull: true
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
