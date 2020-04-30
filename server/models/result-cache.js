const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { Op } = require('sequelize');
const sanitize = require('sanitize-filename');
const appLog = require('../lib/app-log');
const xlsx = require('node-xlsx');
const { parse } = require('json2csv');

// This is a workaround till BigInt is fully supported by the standard
// See https://tc39.es/ecma262/#sec-ecmascript-language-types-bigint-type
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
// If this is not done, then a JSON.stringify(BigInt) throws
// "TypeError: Do not know how to serialize a BigInt"
/* global BigInt:writable */
/* eslint no-extend-native: ["error", { "exceptions": ["BigInt"] }] */
BigInt.prototype.toJSON = function () {
  return this.toString();
};

class ResultCache {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
    this.dbPath = config.get('dbPath');
  }

  xlsxFilePath(id) {
    return path.join(this.dbPath, '/cache/', id + '.xlsx');
  }

  csvFilePath(id) {
    return path.join(this.dbPath, '/cache/', id + '.csv');
  }

  jsonFilePath(id) {
    return path.join(this.dbPath, '/cache/', id + '.json');
  }

  async findOneByCacheKey(id) {
    return this.sequelizeDb.Cache.findOne({ where: { id } });
  }

  async saveResultCache(id, name) {
    if (!id) {
      throw new Error('id required');
    }
    const EIGHT_HOURS = 1000 * 60 * 60 * 8;
    const expiryDate = new Date(Date.now() + EIGHT_HOURS);

    const savedQueryName = sanitize(
      (name || 'SQLPad Query Results') + ' ' + moment().format('YYYY-MM-DD')
    );

    const exists = await this.sequelizeDb.Cache.findOne({ where: { id } });
    if (exists) {
      return this.sequelizeDb.Cache.update(
        { name: savedQueryName, expiryDate },
        { where: { id } }
      );
    }
    return this.sequelizeDb.Cache.create({
      id,
      name: savedQueryName,
      expiryDate,
    });
  }

  async removeExpired() {
    try {
      const docs = await this.sequelizeDb.Cache.findAll({
        where: { expiryDate: { [Op.lt]: new Date() } },
      });

      for (const doc of docs) {
        const filepaths = [
          this.xlsxFilePath(doc.id),
          this.csvFilePath(doc.id),
          this.jsonFilePath(doc.id),
        ];
        filepaths.forEach((fp) => {
          if (fs.existsSync(fp)) {
            fs.unlinkSync(fp);
          }
        });
        // eslint-disable-next-line no-await-in-loop
        await this.sequelizeDb.Cache.destroy({ where: { id: doc.id } });
      }
    } catch (error) {
      appLog.error(error);
    }
  }

  writeXlsx(id, queryResult) {
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
      { name: 'query-results', data: resultArray },
    ]);
    return new Promise((resolve) => {
      fs.writeFile(this.xlsxFilePath(id), xlsxBuffer, function (err) {
        // if there's an error log it but otherwise continue on
        // we can still send results even if download file failed to create
        if (err) {
          appLog.error(err);
        }
        return resolve();
      });
    });
  }

  writeCsv(id, queryResult) {
    return new Promise((resolve) => {
      try {
        const csv = parse(queryResult.rows, { fields: queryResult.fields });
        fs.writeFile(this.csvFilePath(id), csv, function (err) {
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

  writeJson(id, queryResult) {
    return new Promise((resolve) => {
      try {
        const json = JSON.stringify(queryResult.rows);
        fs.writeFile(this.jsonFilePath(id), json, function (err) {
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
