const router = require('express').Router()
const Connection = require('../models/Connection.js')
const Cache = require('../models/Cache.js')
const getSchemaForConnection = require('../lib/get-schema-for-connection.js')
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js')
const sendError = require('../lib/sendError')

function getSchemaForConnectionPromise(connection) {
  return new Promise((resolve, reject) => {
    getSchemaForConnection(connection, function(err, tree) {
      if (err) {
        return reject(err)
      }
      resolve(tree)
    })
  })
}

router.get('/api/schema-info/:connectionId', mustBeAuthenticated, function(
  req,
  res
) {
  const reload = req.query.reload === 'true'
  const cacheKey = 'schemaCache:' + req.params.connectionId
  return Promise.all([
    Connection.findOneById(req.params.connectionId),
    Cache.findOneByCacheKey(cacheKey)
  ])
    .then(results => {
      let [conn, cache] = results

      if (!conn) {
        throw new Error('Connection not found')
      }

      if (cache && !reload && typeof cache.schema !== 'string') {
        return res.json({ schemaInfo: cache.schema })
      }

      if (!cache) {
        cache = new Cache({ cacheKey })
      }

      return getSchemaForConnectionPromise(conn).then(schemaInfo => {
        cache.schema = schemaInfo
        return cache.save().then(() => res.json({ schemaInfo }))
      })
    })
    .catch(error => {
      if (error.message === 'Connection not found') {
        return sendError(res, error)
      }
      sendError(res, error, 'Problem getting schema info')
    })
})

module.exports = router
