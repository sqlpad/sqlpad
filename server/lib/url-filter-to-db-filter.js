const { Op } = require('sequelize');

/**
 * Transforms URL formatted filter parameters to NeDB compatible filter objects
 * @param {string} url formatted filter (i.e. queryText|regex|DELETE)
 * @returns {object} NeDB compatible filter object
 */
module.exports = function urlFilterToDbFilter(urlFilter) {
  let dbFilter = {};
  if (typeof urlFilter === 'string') {
    dbFilter = {
      [Op.and]: urlFilter
        .trim()
        .split(',')
        .map((f) => {
          let dbFilterObj = {};
          if (f) {
            let [key, operator, value] = f.split('|');

            // Do nothing if no value
            if (!value) {
              dbFilterObj = {};

              // Transform only if every required component available
            } else if (key && operator && value) {
              let dbOperator = operator;
              let dbValue = value;
              switch (operator) {
                case 'contains':
                  // SQLite's LIKE is case insensitive
                  dbOperator = Op.like;
                  dbValue = `%${value}%`;
                  break;
                case 'lt':
                case 'gt':
                case 'eq':
                case 'ne':
                  dbOperator = Op[operator];
                  // TODO FIXME - not all equals values will be int (query history status for example)
                  dbValue = parseInt(value);
                  break;
                case 'before':
                  dbOperator = Op.lt;
                  dbValue = new Date(Date.parse(new Date(value).toISOString()));
                  break;
                case 'after':
                  dbOperator = Op.gt;
                  dbValue = new Date(Date.parse(new Date(value).toISOString()));
                  break;
                default:
                  dbOperator = Op[operator];
                  dbValue = value;
              }

              // DB filter object format
              if (dbOperator === Op.eq) {
                dbFilterObj = { [key]: dbValue };
              } else {
                dbFilterObj = {
                  [key]: { [dbOperator]: dbValue },
                };
              }

              // Unknown format
            } else {
              throw new Error(`Invalid filter format: ${f}`);
            }
          }

          return dbFilterObj;
        }),
    };
  }

  return dbFilter;
};
