var _ = require('lodash')
var router = require('express').Router()
var Connection = require('../models/Connection.js')
var Cache = require('../models/Cache.js')
const getSchemaForConnection = require('../lib/get-schema-for-connection.js')
var mustBeAuthenticated = require('../middleware/must-be-authenticated.js')

router.get(
  '/api/schema-info/:connectionId',
  mustBeAuthenticated,
  function initLocals(req, res, next) {
    res.locals.reload = req.query.reload === 'true'
    res.locals.tree = {}
    res.locals.cacheKey = null
    res.locals.connection = null
    res.locals.connectionId = req.params.connectionId
    next()
  },
  function getConnection(req, res, next) {
    Connection.findOneById(res.locals.connectionId, function(err, conn) {
      if (err) {
        console.error(err)
        return res.json({
          error: 'Problem querying connection database'
        })
      }
      if (!conn) {
        return res.json({
          error: 'Connection not found'
        })
      }
      res.locals.connection = conn
      res.locals.cacheKey = 'schemaCache:' + res.locals.connectionId
      next()
    })
  },
  function getCache(req, res, next) {
    Cache.findOneByCacheKey(res.locals.cacheKey, function(err, cache) {
      if (err) {
        console.error(err)
        return res.json({
          error: 'Problem querying cache database'
        })
      }
      if (cache && !res.locals.reload) {
        return res.json({
          schemaInfo: JSON.parse(cache.schema)
        })
      }
      if (!cache) {
        cache = new Cache({ cacheKey: res.locals.cacheKey })
      }
      res.locals.cache = cache
      next()
    })
  },
  function runSchemaQuery(req, res, next) {
    const connection = res.locals.connection
    getSchemaForConnection(connection, function(err, tree) {
      if (err) {
        console.error(err)
        return res.json({
          error: 'Problem running schema info query'
        })
      }
      res.locals.tree = tree
      next()
    })
  },
  function updateCacheAndRender(req, res, next) {
    if (!_.isEmpty(res.locals.tree)) {
      var cache = res.locals.cache
      cache.schema = JSON.stringify(res.locals.tree)
      cache.save(function(err, newCache) {
        if (err) {
          console.error(err)
          return res.json({
            error: 'Problem saving cache'
          })
        }
        return res.json({
          schemaInfo: res.locals.tree
        })
      })
    } else {
      res.json({
        schemaInfo: res.locals.tree
      })
    }
  }
)

module.exports = router
