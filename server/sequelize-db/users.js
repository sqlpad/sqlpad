const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  const Users = sequelize.define(
    'Users',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isLowercase: true,
        },
      },
      // User account ID for LDAP authentication
      // Currently this is used as a fallback when ldap profile.mail is not available
      ldapId: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isLowercase: true,
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isLowercase: true,
          isIn: [['admin', 'editor', 'viewer']],
        },
      },
      syncAuthRole: {
        type: DataTypes.BOOLEAN,
      },
      name: {
        type: DataTypes.STRING,
      },
      disabled: {
        type: DataTypes.BOOLEAN,
      },
      passhash: {
        type: DataTypes.STRING,
      },
      passwordResetId: {
        type: DataTypes.UUID,
      },
      data: {
        type: DataTypes.JSON,
      },
      signupAt: {
        type: DataTypes.DATE,
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
      tableName: 'users',
      underscored: true,
    }
  );

  return Users;
};
