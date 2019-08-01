const fs = require('fs');
const path = require('path');
const Joi = require('joi');
const db = require('../lib/db.js');
const xlsx = require('node-xlsx');
const json2csv = require('json2csv');
const config = require('../lib/config');
const dbPath = config.get('dbPath');

const schema = {
  _id: Joi.string().optional(), // will be auto-gen by nedb
  cacheKey: Joi.string().required(), // unique, manually provided
  expiration: Joi.date().optional(), // item and associated cache files are removed on expiration
  queryName: Joi.string().optional(), // used for file names if a file is downloaded
  schema: Joi.any().optional(), // schema tree in JSON if that's what we're caching
  createdDate: Joi.date().default(new Date(), 'time of creation'),
  modifiedDate: Joi.date().default(new Date(), 'time of modification')
};

function Cache(data) {
  this._id = data._id;
  this.cacheKey = data.cacheKey;
  this.expiration = data.expiration;
  this.queryName = data.queryName;
  this.schema = data.schema; // schema tree in JSON if that's what we're caching
  this.createdDate = data.createdDate;
  this.modifiedDate = data.modifiedDate;
}

Cache.prototype.xlsxFilePath = function xlsxFilePath() {
  return path.join(dbPath, '/cache/', this.cacheKey + '.xlsx');
};

Cache.prototype.csvFilePath = function csvFilePath() {
  return path.join(dbPath, '/cache/', this.cacheKey + '.csv');
};

Cache.prototype.filePaths = function filePaths() {
  // these may not exist.
  // eventually actual files should be stored on the cache item
  return [this.xlsxFilePath(), this.csvFilePath()];
};

Cache.prototype.removeFiles = function removeFiles() {
  const filepaths = this.filePaths();
  filepaths.forEach(fp => {
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp);
    }
  });
};

Cache.prototype.expire = function expire() {
  this.removeFiles();
  return db.cache.remove({ _id: this._id }, {});
};

Cache.prototype.writeXlsx = function writeXlsx(queryResult) {
  const self = this;
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
    fs.writeFile(self.xlsxFilePath(), xlsxBuffer, function(err) {
      // if there's an error log it but otherwise continue on
      // we can still send results even if download file failed to create
      if (err) {
        console.log(err);
      }
      return resolve();
    });
  });
};

Cache.prototype.writeCsv = function writeCsv(queryResult) {
  const self = this;
  return new Promise(resolve => {
    json2csv({ data: queryResult.rows, fields: queryResult.fields }, function(
      err,
      csv
    ) {
      if (err) {
        console.log(err);
        return resolve();
      }
      fs.writeFile(self.csvFilePath(), csv, function(err) {
        if (err) {
          console.log(err);
        }
        return resolve();
      });
    });
  });
};

Cache.prototype.save = function save() {
  const self = this;
  this.modifiedDate = new Date();
  const joiResult = Joi.validate(self, schema);
  if (joiResult.error) {
    return Promise.reject(joiResult.error);
  }
  return db.cache
    .update({ cacheKey: self.cacheKey }, joiResult.value, { upsert: true })
    .then(() => Cache.findOneByCacheKey(self.cacheKey));
};

/*  Query methods
============================================================================== */
Cache.findOneByCacheKey = cacheKey =>
  db.cache.findOne({ cacheKey }).then(doc => doc && new Cache(doc));

Cache.findExpired = () =>
  db.cache
    .find({ expiration: { $lt: new Date() } })
    .then(docs => docs.map(doc => new Cache(doc)));

Cache.removeExpired = () =>
  Cache.findExpired()
    .then(caches => Promise.all(caches.map(cache => cache.expire())))
    .catch(console.error);

// Every five minutes check and expire cache
const FIVE_MINUTES = 1000 * 60 * 5;
setInterval(Cache.removeExpired, FIVE_MINUTES);

module.exports = Cache;
