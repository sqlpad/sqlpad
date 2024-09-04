import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Cache = sequelize.define(
    'Cache',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSON,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'cache',
      underscored: true,
      updatedAt: false,
    }
  );

  return Cache;
}
