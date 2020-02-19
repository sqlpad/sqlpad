const fs = require('fs');
const path = require('path');
const moment = require('moment');
const sanitize = require('sanitize-filename');
const logger = require('../lib/logger');
const xlsx = require('node-xlsx');
const { parse } = require('json2csv');
const config = require('../lib/config');
const dbPath = config.get('dbPath');

function xlsxFilePath(cacheKey) {
  return path.join(dbPath, '/cache/', cacheKey + '.xlsx');
}

function csvFilePath(cacheKey) {
  return path.join(dbPath, '/cache/', cacheKey + '.csv');
}

function jsonFilePath(cacheKey) {
  return path.join(dbPath, '/cache/', cacheKey + '.json');
}

function makeResultCache(nedb) {
  async function findOneByCacheKey(cacheKey) {
    return nedb.cache.findOne({ cacheKey });
  }

  async function saveResultCache(cacheKey, queryName) {
    if (!cacheKey) {
      throw new Error('cacheKey required');
    }
    const EIGHT_HOURS = 1000 * 60 * 60 * 8;
    const expiration = new Date(Date.now() + EIGHT_HOURS);
    const modifiedDate = new Date();

    const savedQueryName = sanitize(
      (queryName || 'SQLPad Query Results') +
        ' ' +
        moment().format('YYYY-MM-DD')
    );

    const doc = {
      cacheKey,
      expiration,
      queryName: savedQueryName,
      modifiedDate
    };

    const existing = await findOneByCacheKey(cacheKey);
    if (!existing) {
      doc.createdDate = new Date();
    }

    return nedb.cache.update({ cacheKey }, doc, {
      upsert: true
    });
  }

  async function removeExpired() {
    try {
      const docs = await nedb.cache.find({ expiration: { $lt: new Date() } });
      for (const doc of docs) {
        const filepaths = [
          xlsxFilePath(doc.cacheKey),
          csvFilePath(doc.cacheKey)
        ];
        filepaths.forEach(fp => {
          if (fs.existsSync(fp)) {
            fs.unlinkSync(fp);
          }
        });
        // eslint-disable-next-line no-await-in-loop
        await nedb.cache.remove({ _id: doc._id }, {});
      }
    } catch (error) {
      logger.error(error);
    }
  }

  return {
    csvFilePath,
    findOneByCacheKey,
    jsonFilePath,
    removeExpired,
    saveResultCache,
    writeCsv,
    writeJson,
    writeXlsx,
    xlsxFilePath
  };
}

function writeXlsx(cacheKey, queryResult) {
  // loop through rows and build out an array of arrays
  const resultArray = [];
  resultArray.push(queryResult.fields);
  for (let i = 0; i < queryResult.rows.length; i++) {
    const row = [];
    for (let c = 0; c < queryResult.fields.length; c++) {
      const fieldName = queryResult.fields[c];
      row.push(queryResult.rows[i][fieldName]);
    }
    resultArray.push(row);
  }
  const xlsxBuffer = xlsx.build([{ name: 'query-results', data: resultArray }]);
  return new Promise(resolve => {
    fs.writeFile(xlsxFilePath(cacheKey), xlsxBuffer, function(err) {
      // if there's an error log it but otherwise continue on
      // we can still send results even if download file failed to create
      if (err) {
        logger.error(err);
      }
      return resolve();
    });
  });
}

function writeCsv(cacheKey, queryResult) {
  return new Promise(resolve => {
    try {
      const csv = parse(queryResult.rows, { fields: queryResult.fields });
      fs.writeFile(csvFilePath(cacheKey), csv, function(err) {
        if (err) {
          logger.error(err);
        }
        return resolve();
      });
    } catch (error) {
      logger.error(error);
      return resolve();
    }
  });
}

// This is a workaround till BigInt is fully supported by the standard
// See https://tc39.es/ecma262/#sec-ecmascript-language-types-bigint-type
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
// If this is not done, then a JSON.stringify(BigInt) throws
// "TypeError: Do not know how to serialize a BigInt"
/* global BigInt:writable */
/* eslint no-extend-native: ["error", { "exceptions": ["BigInt"] }] */
BigInt.prototype.toJSON = function() {
  return this.toString();
};

function writeJson(cacheKey, queryResult) {
  return new Promise(resolve => {
    try {
      const json = JSON.stringify(queryResult.rows);
      fs.writeFile(jsonFilePath(cacheKey), json, function(err) {
        if (err) {
          logger.error(err);
        }
        return resolve();
      });
    } catch (error) {
      logger.error(error);
      return resolve();
    }
  });
}

module.exports = makeResultCache;
