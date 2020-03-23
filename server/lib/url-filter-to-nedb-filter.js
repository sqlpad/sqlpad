/**
 * Transforms URL formatted filter parameters to NeDB compatible filter objects
 * @param {string} url formatted filter (i.e. queryText|regex|DELETE)
 * @returns {object} NeDB compatible filter object
 */
module.exports = function urlFilterToNeDbFilter(urlFilter) {
  let neDbFilter = {};
  if (typeof urlFilter === 'string') {
    neDbFilter = {
      $and: urlFilter
        .trim()
        .split(',')
        .map(f => {
          let neDbFilterObj = {};
          if (f) {
            let [key, operator, value] = f.split('|');

            // Do nothing if no value
            if (!value) {
              neDbFilterObj = {};

              // Transform only if every required component available
            } else if (key && operator && value) {
              let neDbOperator = operator;
              let neDbValue = value;
              switch (operator) {
                case 'regex':
                  neDbOperator = `$${operator}`;
                  neDbValue = new RegExp(value);
                  break;
                case 'lt':
                case 'gt':
                case 'eq':
                case 'ne':
                  neDbOperator = `$${operator}`;
                  neDbValue = parseInt(value);
                  break;
                case 'before':
                  neDbOperator = '$lt';
                  neDbValue = new Date(
                    Date.parse(new Date(value).toISOString())
                  );
                  break;
                case 'after':
                  neDbOperator = '$gt';
                  neDbValue = new Date(
                    Date.parse(new Date(value).toISOString())
                  );
                  break;
                default:
                  neDbOperator = `$${operator}`;
                  neDbValue = value;
              }

              // NeDB filter object format
              if (neDbOperator === '$eq') {
                neDbFilterObj = { [key]: neDbValue };
              } else {
                neDbFilterObj = {
                  [key]: { [neDbOperator]: neDbValue }
                };
              }

              // Unknown format
            } else {
              throw new Error(`Invalid filter format: ${f}`);
            }
          }

          return neDbFilterObj;
        })
    };
  }

  return neDbFilter;
};
