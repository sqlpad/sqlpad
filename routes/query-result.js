var runQuery = require('../lib/run-query.js')
var sanitize = require('sanitize-filename')
var moment = require('moment')
var async = require('async')
var router = require('express').Router()
var config = require('../lib/config.js')
var decipher = require('../lib/decipher.js')
var Connection = require('../models/Connection.js')
var Cache = require('../models/Cache.js')
var Query = require('../models/Query.js')
var mustBeAuthenticated = require('../middleware/must-be-authenticated.js')
var mustBeAuthenticatedOrChartLink = require('../middleware/must-be-authenticated-or-chart-link-noauth.js')

// this allows executing a query relying on the saved query text
// instead of relying on an open endpoint that executes arbitrary sql
router.get('/api/query-result/:_queryId', mustBeAuthenticatedOrChartLink, function (req, res) {
  Query.findOneById(req.params._queryId, function (err, query) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem querying query database'
      })
    }
    if (!query) {
      return res.json({
        error: 'Query not found for that Id (please save query first)'
      })
    }
    var data = {
      connectionId: query.connectionId,
      cacheKey: query._id,
      queryName: query.name,
      queryText: query.queryText
    }
    getQueryResult(data, function (err, queryResult) {
      if (err) {
        console.error(err)
        // Return the error here since it might have info on why the query is bad
        return res.json({
          error: err.toString()
        })
      }
      return res.json({
        queryResult: queryResult
      })
    })
  })
})

// accepts raw inputs from client
// used during query editing
router.post('/api/query-result', mustBeAuthenticated, function (req, res) {
  var data = {
    connectionId: req.body.connectionId,
    cacheKey: req.body.cacheKey,
    queryName: req.body.queryName,
    queryText: req.body.queryText
  }
  getQueryResult(data, function (err, queryResult) {
    if (err) {
      console.error(err)
      // Return the error here since it might have info on why the query is bad
      return res.json({
        error: err.toString()
      })
    }
    return res.send({
      queryResult: queryResult
    })
  })
})

function getQueryResult (data, getQueryResultCallback) {
  async.waterfall([
    function startwaterfall (waterfallNext) {
      waterfallNext(null, data)
    },
    getConnection,
    updateCache,
    execRunQuery,
    createDownloads
  ], function (err, data) {
    var queryResult = (data && data.queryResult ? data.queryResult : null)
    return getQueryResultCallback(err, queryResult)
  })
}

function getConnection (data, next) {
  Connection.findOneById(data.connectionId, function (err, connection) {
    if (err) return next(err)
    if (!connection) return next('Please choose a connection')
    connection.maxRows = Number(config.get('queryResultMaxRows'))
    connection.username = decipher(connection.username)
    connection.password = decipher(connection.password)
    data.connection = connection
    return next(null, data)
  })
}

function updateCache (data, next) {
  var now = new Date()
  var expirationDate = new Date(now.getTime() + (1000 * 60 * 60 * 8)) // 8 hours in the future.
  Cache.findOneByCacheKey(data.cacheKey, function (err, cache) {
    if (err) return next(err)
    if (!cache) {
      cache = new Cache({cacheKey: data.cacheKey})
    }
    cache.queryName = sanitize((data.queryName || 'SQLPad Query Results') + ' ' + moment().format('YYYY-MM-DD'))
    cache.expiration = expirationDate
    cache.save(function (err, newCache) {
      if (err) return next(err)
      data.cache = newCache
      return next(null, data)
    })
  })
}

function execRunQuery (data, next) {
  runQuery(data.queryText, data.connection, function (err, queryResult) {
    if (err) return next(err)
    data.queryResult = queryResult
    data.queryResult.cacheKey = data.cacheKey
    return next(null, data)
  })
}

function createDownloads (data, next) {
  const ALLOW_CSV_DOWNLOAD = config.get('allowCsvDownload')
  if (ALLOW_CSV_DOWNLOAD) {
    var queryResult = data.queryResult
    var cache = data.cache
    cache.writeXlsx(queryResult, function () {
      cache.writeCsv(queryResult, function () {
        return next(null, data)
      })
    })
  } else {
    return next(null, data)
  }
}

module.exports = router
