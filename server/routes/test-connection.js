const router = require('express').Router()
const { testConnection } = require('../drivers/index')
const mustBeAdmin = require('../middleware/must-be-admin.js')
const sendError = require('../lib/sendError')

router.post('/api/test-connection', mustBeAdmin, function(req, res) {
  const { body } = req
  return testConnection(body)
    .then(queryResult => res.send({ results: queryResult.rows }))
    .catch(error => sendError(res, error))
})

module.exports = router
