const fs = require('fs');
const path = require('path');
const moment = require('moment');
const sanitize = require('sanitize-filename');
const appLog = require('../lib/appLog');
const xlsx = require('node-xlsx');
const { parse } = require('json2csv');

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

class ResultCache {
  /**
   * @param {*} nedb
   * @param {import('../lib/config')} config
   */
  constructor(nedb, config) {
    this.nedb = nedb;
    this.config = config;
    this.dbPath = config.get('dbPath');
  }

  xlsxFilePath(cacheKey) {
    return path.join(this.dbPath, '/cache/', cacheKey + '.xlsx');
  }

  csvFilePath(cacheKey) {
    return path.join(this.dbPath, '/cache/', cacheKey + '.csv');
  }

  jsonFilePath(cacheKey) {
    return path.join(this.dbPath, '/cache/', cacheKey + '.json');
  }

  async findOneByCacheKey(cacheKey) {
    return this.nedb.cache.findOne({ cacheKey });
  }

  async saveResultCache(cacheKey, queryName) {
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

    const existing = await this.findOneByCacheKey(cacheKey);
    if (!existing) {
      doc.createdDate = new Date();
    }

    return this.nedb.cache.update({ cacheKey }, doc, {
      upsert: true
    });
  }

  async removeExpired() {
    try {
      const docs = await this.nedb.cache.find({
        expiration: { $lt: new Date() }
      });
      for (const doc of docs) {
        const filepaths = [
          this.xlsxFilePath(doc.cacheKey),
          this.csvFilePath(doc.cacheKey)
        ];
        filepaths.forEach(fp => {
          if (fs.existsSync(fp)) {
            fs.unlinkSync(fp);
          }
        });
        // eslint-disable-next-line no-await-in-loop
        await this.nedb.cache.remove({ _id: doc._id }, {});
      }
    } catch (error) {
      appLog.error(error);
    }
  }

  writeXlsx(cacheKey, queryResult) {
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
    const xlsxBuffer = xlsx.build([
      { name: 'query-results', data: resultArray }
    ]);
    return new Promise(resolve => {
      fs.writeFile(this.xlsxFilePath(cacheKey), xlsxBuffer, function(err) {
        // if there's an error log it but otherwise continue on
        // we can still send results even if download file failed to create
        if (err) {
          appLog.error(err);
        }
        return resolve();
      });
    });
  }

  writeCsv(cacheKey, queryResult) {
    return new Promise(resolve => {
      try {
        const csv = parse(queryResult.rows, { fields: queryResult.fields });
        fs.writeFile(this.csvFilePath(cacheKey), csv, function(err) {
          if (err) {
            appLog.error(err);
          }
          return resolve();
        });
      } catch (error) {
        appLog.error(error);
        return resolve();
      }
    });
  }

  writeJson(cacheKey, queryResult) {
    return new Promise(resolve => {
      try {
        const json = JSON.stringify(queryResult.rows);
        fs.writeFile(this.jsonFilePath(cacheKey), json, function(err) {
          if (err) {
            appLog.error(err);
          }
          return resolve();
        });
      } catch (error) {
        appLog.error(error);
        return resolve();
      }
    });
  }
}

module.exports = ResultCache;
