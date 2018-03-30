const router = require('express').Router()
const runQuery = require('../lib/run-query.js')
const mustBeAdmin = require('../middleware/must-be-admin.js')
const sendError = require('../lib/sendError')

router.post('/api/test-connection', mustBeAdmin, function(req, res) {
  const { body } = req
  let testQuery = "SELECT 'success' AS TestQuery;"
  // TODO move this to drivers implementation
  if (body.driver === 'crate') {
    testQuery = 'SELECT name from sys.cluster'
  }
  if (body.driver === 'presto') {
    testQuery = "SELECT 'success' AS TestQuery"
  }
  if (body.driver === 'hdb') {
    testQuery = 'select * from DUMMY'
  }
  return runQuery(testQuery, body)
    .then(queryResult => res.send({ results: queryResult.rows }))
    .catch(error => sendError(res, error))
})

module.exports = router
