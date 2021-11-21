const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  const Queries = sequelize.define(
    'Queries',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      connectionId: {
        type: DataTypes.STRING,
      },
      queryText: {
        type: DataTypes.TEXT,
      },
      // With addition of multiple queries per query...
      // unsure what direction charts will go.
      // Leaving this as a JSON object
      chart: {
        type: DataTypes.JSON,
        validate: {
          matchesShape(value) {
            if (value && typeof value.chartType !== 'string') {
              throw new Error('chart.chartType must be a string');
            }
            // value.fields could also exist
            // it is an object map of { fieldname: value }
            // These are a mix of <chartField>:<resultColumn>, and <chartOption>:<value>
            // This will probably become more formalized if charting is revisted
            // Because Dates, null, Arrays, and objects are "objects" in JS,
            // we won't bother checking for it.
            // This is more for documentation and this is a nice place to put it.
          },
        },
      },
      // createdBy used to be email address, but now stores userId as of v5
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // updatedBy used to be email address, but now stores userId as of v5
      updatedBy: {
        type: DataTypes.STRING,
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
      tableName: 'queries',
      underscored: true,
    }
  );

  return Queries;
};
