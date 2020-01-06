const router = require('express').Router();
const uuid = require('uuid');
const getMeta = require('../lib/getMeta');
const queryHistoryUtil = require('../models/queryHistory.js');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const sendError = require('../lib/sendError');
const config = require('../lib/config');

function urlFilterToNeDbFilter(urlFilter) {
  let neDbFilter = [];
  if (typeof urlFilter !== 'string') {
    neDbFilter = [];
  } else {
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
}

router.get('/api/query-history', mustBeAdmin, async function(req, res) {
  try {
    const queryResult = {
      id: uuid.v4(),
      cacheKey: null,
      startTime: new Date(),
      stopTime: null,
      queryRunTime: null,
      fields: [],
      incomplete: false,
      meta: {},
      rows: []
    };

    // Convert URL filter to NeDB compatible filter object
    const dbFilter = urlFilterToNeDbFilter(req.query.filter);
    const queryHistory = await queryHistoryUtil.findByFilter(dbFilter);

    queryHistory.map(q => {
      delete q._id;
      delete q.userId;
      delete q.connectionId;
      return q;
    });

    queryResult.incomplete =
      queryHistory.length >= config.get('queryHistoryResultMaxRows');
    queryResult.rows = queryHistory;
    queryResult.stopTime = new Date();
    queryResult.queryRunTime = queryResult.stopTime - queryResult.startTime;
    queryResult.meta = getMeta(queryHistory);
    queryResult.fields = Object.keys(queryResult.meta);

    return res.json({ queryResult });
  } catch (error) {
    sendError(res, error, error.message);
  }
});

router.get('/api/query-history/:_id', mustBeAdmin, async function(req, res) {
  try {
    const queryHistoryItem = await queryHistoryUtil.findOneById(req.params._id);
    if (!queryHistoryItem) {
      return sendError(res, null, 'Query history item not found');
    }
    return res.json({ queryHistoryItem });
  } catch (error) {
    sendError(res, error, 'Problem querying query history database');
  }
});

module.exports = router;
