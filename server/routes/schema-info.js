const router = require('express').Router()
const Connection = require('../models/Connection.js')
const Cache = require('../models/Cache.js')
const getSchemaForConnection = require('../lib/get-schema-for-connection.js')
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js')
const sendError = require('../lib/sendError')

router.get(
  '/api/schema-info/:connectionId',
  mustBeAuthenticated,
  function getConnection(req, res) {
    const reload = req.query.reload === 'true'
    const cacheKey = 'schemaCache:' + req.params.connectionId
    let connection, cache

    return Connection.findOneById(req.params.connectionId)
      .then(conn => {
        if (!conn) {
          throw new Error('Connection not found')
        }
        connection = conn
        return Cache.findOneByCacheKey(cacheKey)
      })
      .then(foundCache => {
        if (foundCache) {
          cache = foundCache
        } else {
          cache = new Cache({ cacheKey })
        }

        if (foundCache && !reload) {
          return JSON.parse(foundCache.schema)
        }

        return getSchemaForConnectionPromise(connection)
      })
      .then(schemaInfo => {
        if (Object.keys(schemaInfo).length) {
          cache.schema = JSON.stringify(schemaInfo)
          return cache.save().then(() => schemaInfo)
        }
        return schemaInfo
      })
      .then(schemaInfo => res.json({ schemaInfo }))
      .catch(error => {
        if (error.message === 'Connection not found') {
          return sendError(res, error)
        }
        sendError(res, error, 'Problem getting schema info')
      })
  }
)

function getSchemaForConnectionPromise(connection) {
  return new Promise((resolve, reject) => {
    getSchemaForConnection(connection, function(err, tree) {
      if (err) {
        reject(err)
      }
      resolve(tree)
    })
  })
}

module.exports = router
