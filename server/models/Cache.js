var fs = require('fs')
var path = require('path')
var Joi = require('joi')
var db = require('../lib/db.js')
var xlsx = require('node-xlsx')
var json2csv = require('json2csv')
const { dbPath } = require('../lib/config').getPreDbConfig()

var schema = {
  _id: Joi.string().optional(), // will be auto-gen by nedb
  cacheKey: Joi.string().required(), // unique, manually provided
  expiration: Joi.date().optional(), // item and associated cache files are removed on expiration
  queryName: Joi.string().optional(), // used for file names if a file is downloaded
  schema: Joi.string().optional(), // schema tree in JSON if that's what we're caching
  createdDate: Joi.date().default(new Date(), 'time of creation'),
  modifiedDate: Joi.date().default(new Date(), 'time of modification')
}

var Cache = function Cache(data) {
  this._id = data._id
  this.cacheKey = data.cacheKey
  this.expiration = data.expiration
  this.queryName = data.queryName
  this.schema = data.schema // schema tree in JSON if that's what we're caching
  this.createdDate = data.createdDate
  this.modifiedDate = data.modifiedDate
}

Cache.prototype.xlsxFilePath = function CacheXlsxFilePath() {
  return path.join(dbPath, '/cache/', this.cacheKey + '.xlsx')
}

Cache.prototype.csvFilePath = function CacheCsvFilePath() {
  return path.join(dbPath, '/cache/', this.cacheKey + '.csv')
}

Cache.prototype.filePaths = function CacheFilePaths() {
  // these may not exist.
  // eventually actual files should be stored on the cache item
  return [this.xlsxFilePath(), this.csvFilePath()]
}

Cache.prototype.removeFiles = function CacheRemoveFiles() {
  var filepaths = this.filePaths()
  filepaths.forEach(function(fp) {
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp)
    }
  })
}

Cache.prototype.expire = function CacheExpire() {
  this.removeFiles()
  db.cache.remove({ _id: this._id }, {})
}

Cache.prototype.writeXlsx = function CacheWriteXlsx(queryResult, callback) {
  // TODO - record that xlsx was written for this cache item?
  var self = this
  // loop through rows and build out an array of arrays
  var resultArray = []
  resultArray.push(queryResult.fields)
  for (var i = 0; i < queryResult.rows.length; i++) {
    var row = []
    for (var c = 0; c < queryResult.fields.length; c++) {
      var fieldName = queryResult.fields[c]
      row.push(queryResult.rows[i][fieldName])
    }
    resultArray.push(row)
  }
  var xlsxBuffer = xlsx.build([{ name: 'query-results', data: resultArray }]) // returns a buffer
  fs.writeFile(self.xlsxFilePath(), xlsxBuffer, function(err) {
    // if there's an error log it but otherwise continue on
    // we can still send results even if download file failed to create
    if (err) {
      console.log(err)
    }
    return callback()
  })
}

Cache.prototype.writeCsv = function CacheWriteCsv(queryResult, callback) {
  // TODO - record csv was written for this cache item?
  var self = this
  json2csv({ data: queryResult.rows, fields: queryResult.fields }, function(
    err,
    csv
  ) {
    if (err) {
      console.log(err)
      return callback()
    }
    fs.writeFile(self.csvFilePath(), csv, function(err) {
      if (err) console.log(err)
      return callback()
    })
  })
}

Cache.prototype.save = function CacheSave(callback) {
  var self = this
  this.modifiedDate = new Date()
  var joiResult = Joi.validate(self, schema)
  if (joiResult.error) return callback(joiResult.error)
  db.cache.update(
    { cacheKey: self.cacheKey },
    joiResult.value,
    { upsert: true },
    function(err) {
      if (err) return callback(err)
      return Cache.findOneByCacheKey(self.cacheKey, callback)
    }
  )
}

/*  Query methods
============================================================================== */

Cache.findOneByCacheKey = function CacheFindOneByCacheKey(cacheKey, callback) {
  db.cache.findOne({ cacheKey: cacheKey }, function(err, doc) {
    if (err) return callback(err)
    if (!doc) return callback()
    return callback(err, new Cache(doc))
  })
}

Cache.findExpired = function CacheFindExpired(callback) {
  var now = new Date()
  db.cache.find({ expiration: { $lt: now } }, function(err, docs) {
    if (err) return callback(err)
    var caches = docs.map(function(doc) {
      return new Cache(doc)
    })
    return callback(null, caches)
  })
}

Cache.removeExpired = function CacheRemoveExpired(callback) {
  Cache.findExpired(function(err, caches) {
    if (err) {
      console.error(err)
      return callback(err)
    }
    caches.forEach(function(cache) {
      cache.expire()
    })
  })
}

// Every five minutes check and expire cache
var FIVE_MINUTES = 1000 * 60 * 5
setInterval(Cache.removeExpired, FIVE_MINUTES)

module.exports = Cache
