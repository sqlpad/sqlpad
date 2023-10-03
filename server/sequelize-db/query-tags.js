const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  const QueryTags = sequelize.define(
    'QueryTags',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      queryId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tag: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'query_tags',
      underscored: true,
      timestamps: false,
    }
  );

  return QueryTags;
};
