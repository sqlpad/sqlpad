import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Sessions = sequelize.define(
    'Sessions',
    {
      sid: {
        type: DataTypes.STRING(36),
        primaryKey: true,
      },
      expires: {
        type: DataTypes.DATE,
      },
      data: {
        type: DataTypes.TEXT,
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
      tableName: 'sessions',
      underscored: true,
    }
  );

  return Sessions;
}
