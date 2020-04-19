const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  const Queries = sequelize.define(
    'Queries',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      connectionId: {
        type: DataTypes.STRING
      },
      queryText: {
        type: DataTypes.TEXT
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
          }
        }
      },
      // createdBy is an email address
      // (possibly weird, but user ids may not be known ahead of time
      // email is human friendly too
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // updatedBy is also an email address. Originally modifiedBy
      updatedBy: {
        type: DataTypes.STRING
      },
      createdAt: {
        type: DataTypes.DATE
      },
      // Originally modifiedDate
      updatedAt: {
        type: DataTypes.DATE
      },
      // Originally lastAccessDate
      lastAccessedAt: {
        type: DataTypes.DATE
      }
    },
    {
      tableName: 'queries',
      underscored: true
    }
  );

  return Queries;
};
