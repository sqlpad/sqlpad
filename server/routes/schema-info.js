var _ = require('lodash')
var router = require('express').Router()
var Connection = require('../models/Connection.js')
var Cache = require('../models/Cache.js')
const getSchemaForConnection = require('../lib/get-schema-for-connection.js')
var mustBeAuthenticated = require('../middleware/must-be-authenticated.js')

router.get(
  '/api/schema-info/:connectionId',
  mustBeAuthenticated,
  function getConnection(req, res, next) {
    Connection.findOneById(req.params.connectionId, function(err, conn) {
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
      next()
    })
  },
  function getCache(req, res, next) {
    const reload = req.query.reload === 'true'
    const cacheKey = 'schemaCache:' + req.params.connectionId
    Cache.findOneByCacheKey(cacheKey, function(err, cache) {
      if (err) {
        console.error(err)
        return res.json({
          error: 'Problem querying cache database'
        })
      }
      if (cache && !reload) {
        return res.json({
          schemaInfo: JSON.parse(cache.schema)
        })
      }
      if (!cache) {
        cache = new Cache({ cacheKey })
      }
      res.locals.cache = cache
      next()
    })
  },
  function runSchemaQuery(req, res, next) {
    const { connection } = res.locals
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
    const { cache, tree } = res.locals
    if (!_.isEmpty(tree)) {
      cache.schema = JSON.stringify(tree)
      cache.save(function(err, newCache) {
        if (err) {
          console.error(err)
          return res.json({
            error: 'Problem saving cache'
          })
        }
        return res.json({
          schemaInfo: tree
        })
      })
    } else {
      res.json({
        schemaInfo: tree
      })
    }
  }
)

module.exports = router
